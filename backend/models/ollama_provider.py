import aiohttp
import json
from typing import Dict, Any
from .base import BaseModelProvider, GenerationRequest, GenerationResponse, ModelConfig

class OllamaProvider(BaseModelProvider):
    """Ollama local LLM provider"""
    
    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.base_url = config.base_url or "http://localhost:11434"
    
    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        try:
            params = self.merge_config(request)
            
            # Build prompt with system message if provided
            full_prompt = request.prompt
            if request.system_prompt:
                full_prompt = f"System: {request.system_prompt}\n\nUser: {request.prompt}"
            
            payload = {
                "model": self.model_id,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": params["temperature"],
                    "top_p": params["top_p"],
                    "top_k": params["top_k"],
                    "num_predict": params["max_tokens"]
                }
            }
            
            if request.stop_sequences:
                payload["options"]["stop"] = request.stop_sequences
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=300)
                ) as response:
                    if response.status != 200:
                        raise Exception(f"Ollama API error: {response.status}")
                    
                    data = await response.json()
                    
                    return GenerationResponse(
                        text=data["response"],
                        model=self.model_id,
                        provider=self.provider,
                        usage={
                            "prompt_eval_count": data.get("prompt_eval_count", 0),
                            "eval_count": data.get("eval_count", 0)
                        },
                        metadata={
                            "eval_duration": data.get("eval_duration", 0),
                            "load_duration": data.get("load_duration", 0)
                        }
                    )
        except Exception as e:
            raise Exception(f"Ollama generation failed: {str(e)}")
    
    async def health_check(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags") as response:
                    return response.status == 200
        except:
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "provider": self.provider,
            "model": self.model_id,
            "type": "completion",
            "supports_system_prompt": True,
            "supports_streaming": True,
            "local": True
        }