import anthropic
from typing import Dict, Any
from .base import BaseModelProvider, GenerationRequest, GenerationResponse, ModelConfig

class AnthropicProvider(BaseModelProvider):
    """Anthropic Claude API provider"""
    
    def __init__(self, config: ModelConfig):
        super().__init__(config)
        self.client = anthropic.AsyncAnthropic(
            api_key=config.api_key,
            base_url=config.base_url
        )
    
    async def generate(self, request: GenerationRequest) -> GenerationResponse:
        try:
            params = self.merge_config(request)
            
            response = await self.client.messages.create(
                model=self.model_id,
                max_tokens=params["max_tokens"],
                temperature=params["temperature"],
                top_p=params["top_p"],
                system=request.system_prompt or "",
                messages=[{"role": "user", "content": request.prompt}],
                stop_sequences=request.stop_sequences
            )
            
            return GenerationResponse(
                text=response.content[0].text,
                model=self.model_id,
                provider=self.provider,
                usage={
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens
                }
            )
        except Exception as e:
            raise Exception(f"Anthropic generation failed: {str(e)}")
    
    async def health_check(self) -> bool:
        try:
            # Simple health check - try to create a minimal message
            await self.client.messages.create(
                model=self.model_id,
                max_tokens=1,
                messages=[{"role": "user", "content": "Hi"}]
            )
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