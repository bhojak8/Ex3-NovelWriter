interface APIConfig {
  geminiApiKey: string;
  perplexityApiKey: string;
}

interface GenerationRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: 'gemini' | 'perplexity';
}

class APIService {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
  }

  async generateWithGemini(prompt: string, options: { maxTokens?: number; temperature?: number } = {}) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + this.config.geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.9,
          maxOutputTokens: options.maxTokens || 4096,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }

  async generateWithPerplexity(prompt: string, options: { maxTokens?: number; temperature?: number } = {}) {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.9,
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async generate(request: GenerationRequest): Promise<string> {
    const { prompt, maxTokens = 4096, temperature = 0.9, model = 'gemini' } = request;
    
    try {
      if (model === 'gemini') {
        return await this.generateWithGemini(prompt, { maxTokens, temperature });
      } else {
        return await this.generateWithPerplexity(prompt, { maxTokens, temperature });
      }
    } catch (error) {
      console.error(`Error with ${model}:`, error);
      // Fallback to the other service
      const fallbackModel = model === 'gemini' ? 'perplexity' : 'gemini';
      console.log(`Falling back to ${fallbackModel}`);
      
      if (fallbackModel === 'gemini') {
        return await this.generateWithGemini(prompt, { maxTokens, temperature });
      } else {
        return await this.generateWithPerplexity(prompt, { maxTokens, temperature });
      }
    }
  }
}

export default APIService;
export type { APIConfig, GenerationRequest };