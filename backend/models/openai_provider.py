import openai
from typing import Dict, Any
from .base import BaseModelProvider, GenerationRequest, GenerationResponse, ModelConfig

class OpenAIProvider(BaseModelProvider):
    """OpenAI API provider (GPT-3.5, GPT-4, etc.)"""
    
    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.client = openai.AsyncOpenAI(
            api_key=config.api_key,
            base_url=config.base_url
        )
    
    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        try:
            params = self.merge_config(request)
            
            messages = []
            if request.system_prompt:
                messages.append({"role": "system", "content": request.system_prompt})
            messages.append({"role": "user", "content": request.prompt})
            
            response = await self.client.chat.completions.create(
                model=self.model_id,
                messages=messages,
                max_tokens=params["max_tokens"],
                temperature=params["temperature"],
                top_p=params["top_p"],
                stop=request.stop_sequences
            )
            
            return GenerationResponse(
                text=response.choices[0].message.content,
                model=self.model_id,
                provider=self.provider,
                usage={
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            )
        except Exception as e:
            raise Exception(f"OpenAI generation failed: {str(e)}")
    
    async def health_check(self) -> bool:
        try:
            await self.client.models.list()
            return True
        except:
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "provider": self.provider,
            "model": self.model_id,
            "type": "chat",
            "supports_system_prompt": True,
            "supports_streaming": True
        }