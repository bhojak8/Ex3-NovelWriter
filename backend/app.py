from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
import os

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Expanding.novel_writer import Novel_Writer
from src.model_do import load_model
import torch

app = FastAPI(title="Ex3 Novel Writer API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances (load once at startup)
writer_model = None
writer_tokenizer = None
base_model = None
base_tokenizer = None

@app.on_event("startup")
async def load_models():
    global writer_model, writer_tokenizer, base_model, base_tokenizer
    
    # Load models (update paths as needed)
    writer_path = "/path/to/finetuned/NovelWriter"
    base_path = "/path/to/general/LLM"
    
    try:
        writer_model, writer_tokenizer = load_model(writer_path, device='cuda:0')
        base_model, base_tokenizer = load_model(base_path, device='cuda:1')
        print("Models loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {e}")

# Pydantic models
class ProjectCreate(BaseModel):
    title: str
    genre: str
    premise: str
    writingStyle: str = "三"
    targetLength: str = "medium"
    themes: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    outline: Optional[List[str]] = None
    status: Optional[str] = None

class OutlineRequest(BaseModel):
    premise: str
    genre: str

class PremiseRequest(BaseModel):
    genre: str
    themes: Optional[str] = None

class WritingRequest(BaseModel):
    projectId: str

class ChapterRequest(BaseModel):
    projectId: str
    chapterIndex: int
    previousContext: Optional[str] = None

# In-memory storage (replace with database in production)
projects_db: Dict[str, Dict[str, Any]] = {}
writing_sessions: Dict[str, Dict[str, Any]] = {}

@app.post("/api/projects")
async def create_project(project: ProjectCreate):
    project_id = f"proj_{len(projects_db) + 1}"
    
    project_data = {
        "id": project_id,
        "title": project.title,
        "genre": project.genre,
        "premise": project.premise,
        "writingStyle": project.writingStyle,
        "targetLength": project.targetLength,
        "themes": project.themes,
        "outline": [],
        "chapters": [],
        "status": "planning",
        "progress": 0
    }
    
    projects_db[project_id] = project_data
    return project_data

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_db[project_id]

@app.patch("/api/projects/{project_id}")
async def update_project(project_id: str, updates: ProjectUpdate):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    update_data = updates.dict(exclude_unset=True)
    project.update(update_data)
    
    return project

@app.post("/api/generate/outline")
async def generate_outline(request: OutlineRequest):
    if not writer_model or not writer_tokenizer:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Create a temporary Novel_Writer instance
        novel_writer = Novel_Writer(
            writer_model=writer_model,
            writer_tokenizer=writer_tokenizer,
            base_model=base_model,
            base_tokenzier=base_tokenizer,
            novel_tag=request.genre,
            novel_title=None,
            novel_intro=request.premise,
            level_num=1,
            output_dir="./temp"
        )
        
        # Generate outline using the summary_expand method
        outline = novel_writer.summary_expand(request.premise)
        return outline
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating outline: {str(e)}")

@app.post("/api/generate/premise")
async def generate_premise(request: PremiseRequest):
    if not writer_model or not writer_tokenizer:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    try:
        # Create a temporary Novel_Writer instance for premise generation
        novel_writer = Novel_Writer(
            writer_model=writer_model,
            writer_tokenizer=writer_tokenizer,
            base_model=base_model,
            base_tokenzier=base_tokenizer,
            novel_tag=request.genre,
            novel_title=None,
            novel_intro=None,
            level_num=1,
            output_dir="./temp"
        )
        
        # Generate title and premise
        title, premise = novel_writer.novel_init(request.genre, tmp=0.9)
        
        return {"premise": premise, "title": title}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating premise: {str(e)}")

@app.post("/api/writing/start")
async def start_writing_session(request: WritingRequest):
    project_id = request.projectId
    
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    session_id = f"session_{len(writing_sessions) + 1}"
    session = {
        "id": session_id,
        "projectId": project_id,
        "currentChapter": 0,
        "isActive": True,
        "generatedContent": "",
        "entityDatabase": {}
    }
    
    writing_sessions[session_id] = session
    return session

@app.post("/api/writing/generate-chapter")
async def generate_chapter_content(request: ChapterRequest):
    if not writer_model or not writer_tokenizer:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    project_id = request.projectId
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    try:
        # Create Novel_Writer instance with project data
        novel_writer = Novel_Writer(
            writer_model=writer_model,
            writer_tokenizer=writer_tokenizer,
            base_model=base_model,
            base_tokenzier=base_tokenizer,
            novel_tag=project["genre"],
            novel_title=project["title"],
            novel_intro=project["premise"],
            level_num=1,
            output_dir="./temp"
        )
        
        # Initialize the writer state
        novel_writer.pre_summary_chapter = '无'
        novel_writer.pre_summary_para = '无'
        novel_writer.recent_visit = []
        novel_writer.entity_db = {}
        novel_writer.novel = []
        
        # Get chapter summary from outline
        if request.chapterIndex < len(project["outline"]):
            chapter_summary = project["outline"][request.chapterIndex]
            
            # Generate chapter content
            is_first = request.chapterIndex == 0
            is_last = request.chapterIndex == len(project["outline"]) - 1
            
            novel_writer.chapter_writer(
                chapter_summary, 
                start_flag=is_first, 
                end_flag=is_last
            )
            
            # Extract generated content
            content = "\n".join(novel_writer.novel)
            entities = {
                "characters": list(novel_writer.entity_db.keys())[:10],  # Limit for demo
                "locations": []
            }
            
            return {
                "content": content,
                "entities": entities
            }
        else:
            raise HTTPException(status_code=400, detail="Chapter index out of range")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating chapter: {str(e)}")

@app.get("/api/export/{project_id}")
async def export_novel(project_id: str, format: str = "txt"):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    # Generate export content
    content = f"Title: {project['title']}\n"
    content += f"Genre: {project['genre']}\n"
    content += f"Premise: {project['premise']}\n\n"
    
    for i, chapter in enumerate(project.get('chapters', [])):
        content += f"Chapter {i+1}: {chapter.get('title', f'Chapter {i+1}')}\n"
        content += f"{chapter.get('content', '')}\n\n"
    
    return {"content": content, "filename": f"{project['title']}.{format}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)