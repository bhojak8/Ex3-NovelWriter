interface LocalLLMConfig {
  baseUrl: string;
  model: string;
  apiKey?: string; // Optional for local models
}

interface GenerationRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

class LocalLLMService {
  private config: LocalLLMConfig;

  constructor(config: LocalLLMConfig) {
    this.config = config;
  }

  async generate(request: GenerationRequest): Promise<string> {
    const { prompt, maxTokens = 4096, temperature = 0.9, systemPrompt } = request;
    
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: temperature,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Local LLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error with local LLM:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/models`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/models`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
    } catch {
      return [];
    }
  }
}

export default LocalLLMService;
export type { LocalLLMConfig, GenerationRequest };