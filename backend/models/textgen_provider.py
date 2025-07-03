import aiohttp
import json
from typing import Dict, Any
from .base import BaseModelProvider, GenerationRequest, GenerationResponse, ModelConfig

class TextGenerationWebUIProvider(BaseModelProvider):
    """Text Generation WebUI (oobabooga) provider"""
    
    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.base_url = config.base_url or "http://localhost:5000"
    
    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        try:
            params = self.merge_config(request)
            
            # Build prompt with system message if provided
            full_prompt = request.prompt
            if request.system_prompt:
                full_prompt = f"System: {request.system_prompt}\n\nUser: {request.prompt}\n\nAssistant:"
            
            payload = {
                "prompt": full_prompt,
                "max_new_tokens": params["max_tokens"],
                "temperature": params["temperature"],
                "top_p": params["top_p"],
                "top_k": params["top_k"],
                "do_sample": True,
                "stream": False
            }
            
            if request.stop_sequences:
                payload["stopping_strings"] = request.stop_sequences
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/v1/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=300)
                ) as response:
                    if response.status != 200:
                        raise Exception(f"TextGen WebUI API error: {response.status}")
                    
                    data = await response.json()
                    
                    # Extract generated text (remove the original prompt)
                    generated_text = data["results"][0]["text"]
                    if generated_text.startswith(full_prompt):
                        generated_text = generated_text[len(full_prompt):].strip()
                    
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
            raise Exception(f"TextGen WebUI generation failed: {str(e)}")
    
    async def health_check(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/v1/model") as response:
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