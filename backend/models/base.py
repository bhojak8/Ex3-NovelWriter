from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ModelConfig(BaseModel):
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

class GenerationRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    top_k: Optional[int] = None
    stop_sequences: Optional[List[str]] = None
    system_prompt: Optional[str] = None

class GenerationResponse(BaseModel):
    text: str
    model: str
    provider: str
    usage: Dict[str, Any] = {}
    metadata: Dict[str, Any] = {}

class BaseModelProvider(ABC):
    """Abstract base class for all model providers"""
    
    def __init__(self, config: ModelConfig):
        self.config = config
        self.name = config.name
        self.provider = config.provider
        self.model_id = config.model_id
    
    @abstractmethod
    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        """Generate text using the model"""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the model is available and healthy"""
        pass
    
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the model"""
        pass
    
    def merge_config(self, request: GenerationRequest) -> Dict[str, Any]:
        """Merge request parameters with model config"""
        return {
            "max_tokens": request.max_tokens or self.config.max_tokens,
            "temperature": request.temperature or self.config.temperature,
            "top_p": request.top_p or self.config.top_p,
            "top_k": request.top_k or self.config.top_k,
            **self.config.custom_params
        }