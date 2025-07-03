from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from .models.model_manager import model_manager
from .models.base import ModelConfig, GenerationRequest, GenerationResponse

router = APIRouter(prefix="/api/models", tags=["models"])

class ModelAddRequest(BaseModel):
    name: str
    provider: str
    model_id: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    max_tokens: int = 4096
    temperature: float = 0.9
    top_p: float = 0.9
    top_k: int = 40
    custom_params: Dict[str, Any] = {}

class GenerateRequest(BaseModel):
    model_name: str
    prompt: str
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    top_k: Optional[int] = None
    stop_sequences: Optional[List[str]] = None
    system_prompt: Optional[str] = None

@router.get("/")
async def list_models():
    """List all available models"""
    return model_manager.list_models()

@router.post("/")
async def add_model(request: ModelAddRequest):
    """Add a new model"""
    config = ModelConfig(
        name=request.name,
        provider=request.provider,
        model_id=request.model_id,
        api_key=request.api_key,
        base_url=request.base_url,
        max_tokens=request.max_tokens,
        temperature=request.temperature,
        top_p=request.top_p,
        top_k=request.top_k,
        custom_params=request.custom_params
    )
    
    success = model_manager.add_model(config)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add model")
    
    return {"message": f"Model {request.name} added successfully"}

@router.delete("/{model_name}")
async def remove_model(model_name: str):
    """Remove a model"""
    success = model_manager.remove_model(model_name)
    if not success:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return {"message": f"Model {model_name} removed successfully"}

@router.get("/{model_name}")
async def get_model_info(model_name: str):
    """Get information about a specific model"""
    provider = model_manager.get_model(model_name)
    if not provider:
        raise HTTPException(status_code=404, detail="Model not found")
    
    info = provider.get_model_info()
    info["name"] = model_name
    return info

@router.post("/{model_name}/generate")
async def generate_text(model_name: str, request: GenerateRequest):
    """Generate text using a specific model"""
    try:
        gen_request = GenerationRequest(
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            stop_sequences=request.stop_sequences,
            system_prompt=request.system_prompt
        )
        
        response = await model_manager.generate(model_name, gen_request)
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.get("/{model_name}/health")
async def check_model_health(model_name: str):
    """Check if a specific model is healthy"""
    is_healthy = await model_manager.health_check(model_name)
    return {"model": model_name, "healthy": is_healthy}

@router.get("/health/all")
async def check_all_models_health():
    """Check health of all models"""
    health_status = await model_manager.health_check_all()
    return health_status

@router.post("/providers/scan")
async def scan_local_providers():
    """Scan for available local LLM providers"""
    providers_found = {}
    
    # Check Ollama
    try:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:11434/api/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    providers_found["ollama"] = {
                        "available": True,
                        "models": [model["name"] for model in data.get("models", [])]
                    }
    except:
        providers_found["ollama"] = {"available": False}
    
    # Check llama.cpp
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8080/health") as response:
                providers_found["llamacpp"] = {"available": response.status == 200}
    except:
        providers_found["llamacpp"] = {"available": False}
    
    # Check Text Generation WebUI
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:5000/api/v1/model") as response:
                if response.status == 200:
                    data = await response.json()
                    providers_found["textgen"] = {
                        "available": True,
                        "current_model": data.get("result", "unknown")
                    }
    except:
        providers_found["textgen"] = {"available": False}
    
    return providers_found

# Initialize default models on startup
@router.on_event("startup")
async def startup_event():
    model_manager.load_default_models()