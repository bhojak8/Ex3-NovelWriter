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

# Import the new model management system
from models.model_manager import model_manager
from api_routes import router as models_router

app = FastAPI(title="Ex3 Novel Writer API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the models API router
app.include_router(models_router)

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
    
    # Initialize the model manager with default models
    model_manager.load_default_models()

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
    model_name: Optional[str] = "gpt-3.5-turbo"  # Default model

class PremiseRequest(BaseModel):
    genre: str
    themes: Optional[str] = None
    model_name: Optional[str] = "gpt-3.5-turbo"  # Default model

class WritingRequest(BaseModel):
    projectId: str

class ChapterRequest(BaseModel):
    projectId: str
    chapterIndex: int
    previousContext: Optional[str] = None
    model_name: Optional[str] = "gpt-3.5-turbo"  # Default model

# In-memory storage (replace with database in production)
projects_db: Dict[str, Dict[str, Any]] = {}
writing_sessions: Dict[str, Dict[str, Any]] = {}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Ex3 Novel Writer API is running"}

# Get all projects endpoint
@app.get("/api/projects")
async def get_all_projects():
    return list(projects_db.values())

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
        "progress": 0,
        "createdAt": "2024-01-01T00:00:00Z",
        "modifiedAt": "2024-01-01T00:00:00Z",
        "wordCount": 0
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

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    del projects_db[project_id]
    return {"message": "Project deleted successfully"}

@app.post("/api/generate/outline")
async def generate_outline(request: OutlineRequest):
    try:
        # Use the new model manager system
        from models.base import GenerationRequest
        
        prompt = f"""Create a detailed chapter outline for a {request.genre} novel with the following premise:

{request.premise}

Generate 8-12 chapter summaries, each 1-2 sentences long. Format as a numbered list:

1. Chapter title - Brief description
2. Chapter title - Brief description
...

Focus on story progression, character development, and maintaining reader engagement."""

        gen_request = GenerationRequest(
            prompt=prompt,
            max_tokens=2048,
            temperature=0.8,
            system_prompt="You are a professional novel writer creating detailed story outlines."
        )
        
        response = await model_manager.generate(request.model_name, gen_request)
        
        # Parse the response into an array
        lines = response.text.split('\n')
        chapters = []
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-')):
                # Remove numbering and clean up
                chapter = line.split('.', 1)[-1].strip()
                if chapter:
                    chapters.append(chapter)
        
        return chapters if chapters else [response.text]
        
    except Exception as e:
        # Fallback to original method if model manager fails
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
    try:
        # Use the new model manager system
        from models.base import GenerationRequest
        
        themes_text = f" incorporating themes of {request.themes}" if request.themes else ""
        prompt = f"""Generate a compelling premise for a {request.genre} novel{themes_text}.

Provide both a title and a detailed premise in this format:

Title: [Novel Title]
Premise: [Detailed premise describing the main character, conflict, setting, and what makes this story unique]

The premise should be engaging and give a clear sense of the story's direction."""

        gen_request = GenerationRequest(
            prompt=prompt,
            max_tokens=1024,
            temperature=0.9,
            system_prompt="You are a creative writing assistant specializing in novel concepts."
        )
        
        response = await model_manager.generate(request.model_name, gen_request)
        
        # Parse title and premise from response
        lines = response.text.split('\n')
        title = None
        premise = None
        
        for line in lines:
            line = line.strip()
            if line.lower().startswith('title:'):
                title = line.split(':', 1)[1].strip()
            elif line.lower().startswith('premise:'):
                premise = line.split(':', 1)[1].strip()
        
        return {
            "title": title or f"A {request.genre} Tale",
            "premise": premise or response.text
        }
        
    except Exception as e:
        # Fallback to original method
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
    project_id = request.projectId
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    try:
        # Use the new model manager system first
        from models.base import GenerationRequest
        
        if request.chapterIndex < len(project["outline"]):
            chapter_summary = project["outline"][request.chapterIndex]
            
            # Build context
            context = ""
            if request.previousContext:
                context = f"Previous context: {request.previousContext}\n\n"
            
            style_text = "first person (我)" if project["writingStyle"] == "一" else "third person (他/她)"
            
            prompt = f"""{context}Write a detailed chapter for a {project["genre"]} novel in {style_text} perspective.

Chapter summary: {chapter_summary}

Requirements:
- Write 1000-1500 words
- Use proper paragraphs with dialogue and narrative description
- Focus on character development and atmosphere
- Advance the plot meaningfully
- Include sensory details and emotional depth
- Maintain consistent tone and style

Begin writing the chapter:"""

            gen_request = GenerationRequest(
                prompt=prompt,
                max_tokens=2048,
                temperature=0.8,
                system_prompt=f"You are writing a {project['genre']} novel. Create engaging, well-paced chapters with rich descriptions and compelling dialogue."
            )
            
            response = await model_manager.generate(request.model_name, gen_request)
            
            # Simple entity extraction
            content = response.text
            characters = []
            locations = []
            
            # Extract potential character names (capitalized words)
            import re
            potential_names = re.findall(r'\b[A-Z][a-z]+\b', content)
            characters = list(set(potential_names))[:10]  # Limit to 10
            
            # Extract potential locations
            location_keywords = ['at', 'in', 'near', 'by', 'through']
            for keyword in location_keywords:
                matches = re.findall(f'{keyword} (?:the )?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', content)
                locations.extend(matches)
            locations = list(set(locations))[:10]  # Limit to 10
            
            entities = {
                "characters": characters,
                "locations": locations
            }
            
            return {
                "content": content,
                "entities": entities
            }
        else:
            raise HTTPException(status_code=400, detail="Chapter index out of range")
            
    except Exception as e:
        # Fallback to original method
        if not writer_model or not writer_tokenizer:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
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
    uvicorn.run(app, host="0.0.0.0", port=8000, ssl_keyfile="key.pem", ssl_certfile="cert.pem")