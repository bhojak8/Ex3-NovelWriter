import aiohttp
import json
from typing import Dict, Any
from .base import BaseModelProvider, GenerationRequest, GenerationResponse, ModelConfig

class HuggingFaceProvider(BaseModelProvider):
    """Hugging Face Inference API provider"""
    
    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model_id}"
        self.headers = {"Authorization": f"Bearer {config.api_key}"}
    
    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        try:
            params = self.merge_config(request)
            
            # Build prompt with system message if provided
            full_prompt = request.prompt
            if request.system_prompt:
                full_prompt = f"System: {request.system_prompt}\n\nUser: {request.prompt}\n\nAssistant:"
            
            payload = {
                "inputs": full_prompt,
                "parameters": {
                    "max_new_tokens": params["max_tokens"],
                    "temperature": params["temperature"],
                    "top_p": params["top_p"],
                    "top_k": params["top_k"],
                    "do_sample": True,
                    "return_full_text": False
                }
            }
            
            if request.stop_sequences:
                payload["parameters"]["stop_sequences"] = request.stop_sequences
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    json=payload,
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=300)
                ) as response:
                    if response.status != 200:
                        raise Exception(f"HuggingFace API error: {response.status}")
                    
                    data = await response.json()
                    
                    if isinstance(data, list) and len(data) > 0:
                        generated_text = data[0].get("generated_text", "")
                    else:
                        generated_text = str(data)
                    
                    return GenerationResponse(
                        text=generated_text,
                        model=self.model_id,
                        provider=self.provider,
                        usage={
                            "prompt_tokens": len(full_prompt.split()),
                            "completion_tokens": len(generated_text.split())
                        }
                    )
        except Exception as e:
            raise Exception(f"HuggingFace generation failed: {str(e)}")
    
    async def health_check(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    json={"inputs": "test"},
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    return response.status in [200, 503]  # 503 is "model loading"
        except:
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "provider": self.provider,
            "model": self.model_id,
            "type": "completion",
            "supports_system_prompt": True,
            "supports_streaming": False,
            "cloud": True
        }