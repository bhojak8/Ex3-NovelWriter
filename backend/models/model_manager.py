from typing import Dict, List, Optional, Any
from .base import BaseModelProvider, ModelConfig, GenerationRequest, GenerationResponse
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .ollama_provider import OllamaProvider
from .llamacpp_provider import LlamaCppProvider
from .textgen_provider import TextGenerationWebUIProvider
from .huggingface_provider import HuggingFaceProvider

class ModelManager:
    """Manages multiple AI model providers"""
    
    def __init__(self):
        self.providers: Dict[str, BaseModelProvider] = {}
        self.provider_classes = {
            "openai": OpenAIProvider,
            "anthropic": AnthropicProvider,
            "ollama": OllamaProvider,
            "llamacpp": LlamaCppProvider,
            "textgen": TextGenerationWebUIProvider,
            "huggingface": HuggingFaceProvider
        }
    
    def add_model(self, config: ModelConfig) -> bool:
        """Add a new model provider"""
        try:
            provider_class = self.provider_classes.get(config.provider)
            if not provider_class:
                raise ValueError(f"Unknown provider: {config.provider}")
            
            provider = provider_class(config)
            self.providers[config.name] = provider
            return True
        except Exception as e:
            print(f"Failed to add model {config.name}: {e}")
            return False
    
    def remove_model(self, name: str) -> bool:
        """Remove a model provider"""
        if name in self.providers:
            del self.providers[name]
            return True
        return False
    
    def get_model(self, name: str) -> Optional[BaseModelProvider]:
        """Get a model provider by name"""
        return self.providers.get(name)
    
    def list_models(self) -> List[Dict[str, Any]]:
        """List all available models"""
        models = []
        for name, provider in self.providers.items():
            info = provider.get_model_info()
            info["name"] = name
            models.append(info)
        return models
    
    async def generate(self, model_name: str, request: GenerationRequest) -> GenerationResponse:
        """Generate text using a specific model"""
        provider = self.get_model(model_name)
        if not provider:
            raise ValueError(f"Model not found: {model_name}")
        
        return await provider.generate(request)
    
    async def health_check(self, model_name: str) -> bool:
        """Check if a specific model is healthy"""
        provider = self.get_model(model_name)
        if not provider:
            return False
        
        return await provider.health_check()
    
    async def health_check_all(self) -> Dict[str, bool]:
        """Check health of all models"""
        results = {}
        for name, provider in self.providers.items():
            try:
                results[name] = await provider.health_check()
            except:
                results[name] = False
        return results
    
    def load_default_models(self):
        """Load some default model configurations"""
        default_configs = [
            # OpenAI Models
            ModelConfig(
                name="gpt-4",
                provider="openai",
                model_id="gpt-4",
                api_key="your-openai-api-key"
            ),
            ModelConfig(
                name="gpt-3.5-turbo",
                provider="openai",
                model_id="gpt-3.5-turbo",
                api_key="your-openai-api-key"
            ),
            # Anthropic Models
            ModelConfig(
                name="claude-3-sonnet",
                provider="anthropic",
                model_id="claude-3-sonnet-20240229",
                api_key="your-anthropic-api-key"
            ),
            # Local Models
            ModelConfig(
                name="llama2-local",
                provider="ollama",
                model_id="llama2",
                base_url="http://localhost:11434"
            ),
            ModelConfig(
                name="mistral-local",
                provider="ollama",
                model_id="mistral",
                base_url="http://localhost:11434"
            ),
            ModelConfig(
                name="llamacpp-local",
                provider="llamacpp",
                model_id="local-model",
                base_url="http://localhost:8080"
            ),
            ModelConfig(
                name="textgen-local",
                provider="textgen",
                model_id="local-model",
                base_url="http://localhost:5000"
            ),
            # HuggingFace Models
            ModelConfig(
                name="mistral-7b-hf",
                provider="huggingface",
                model_id="mistralai/Mistral-7B-Instruct-v0.1",
                api_key="your-huggingface-token"
            )
        ]
        
        for config in default_configs:
            self.add_model(config)

# Global model manager instance
model_manager = ModelManager()