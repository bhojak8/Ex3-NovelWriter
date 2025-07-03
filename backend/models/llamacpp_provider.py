import aiohttp
import json
from typing import Dict, Any
from .base import BaseModelProvider, GenerationRequest, GenerationResponse, ModelConfig

class LlamaCppProvider(BaseModelProvider):
    """llama.cpp server provider"""
    
    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.base_url = config.base_url or "http://localhost:8080"
    
    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        try:
            params = self.merge_config(request)
            
            # Build prompt with system message if provided
            full_prompt = request.prompt
            if request.system_prompt:
                full_prompt = f"<|system|>\n{request.system_prompt}\n<|user|>\n{request.prompt}\n<|assistant|>\n"
            
            payload = {
                "prompt": full_prompt,
                "n_predict": params["max_tokens"],
                "temperature": params["temperature"],
                "top_p": params["top_p"],
                "top_k": params["top_k"],
                "stream": False
            }
            
            if request.stop_sequences:
                payload["stop"] = request.stop_sequences
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/completion",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=300)
                ) as response:
                    if response.status != 200:
                        raise Exception(f"llama.cpp API error: {response.status}")
                    
                    data = await response.json()
                    
                    return GenerationResponse(
                        text=data["content"],
                        model=self.model_id,
                        provider=self.provider,
                        usage={
                            "prompt_tokens": data.get("tokens_evaluated", 0),
                            "completion_tokens": data.get("tokens_predicted", 0)
                        },
                        metadata={
                            "generation_time": data.get("generation_time", 0)
                        }
                    )
        except Exception as e:
            raise Exception(f"llama.cpp generation failed: {str(e)}")
    
    async def health_check(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/health") as response:
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