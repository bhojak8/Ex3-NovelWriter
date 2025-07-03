class APIService {
  private baseURL: string;
  private fallbackURLs: string[];

  constructor() {
    // Use HTTP for local development instead of HTTPS
    this.baseURL = 'http://localhost:8000';
    this.fallbackURLs = [
      'http://localhost:8000',
      'http://127.0.0.1:8000'
    ];
  }

  private async fetchWithFallback(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const urls = [this.baseURL, ...this.fallbackURLs];
    
    for (const url of urls) {
      try {
        const response = await fetch(`${url}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        return response;
      } catch (error) {
        console.warn(`Failed to connect to ${url}:`, error);
        if (url === urls[urls.length - 1]) {
          throw new Error('Backend connection failed:\n\n' + (error as Error).message);
        }
      }
    }
    throw new Error('All connection attempts failed');
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithFallback('/health');
      return response.ok;
    } catch (error) {
      throw new Error('Health check failed:\n\n' + `Unable to connect to backend server at ${this.baseURL}. Please ensure the server is running.`);
    }
  }

  async generateNovel(prompt: string, options: any = {}): Promise<any> {
    const response = await this.fetchWithFallback('/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, ...options }),
    });

    if (!response.ok) {
      throw new Error(`Generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getModels(): Promise<any[]> {
    const response = await this.fetchWithFallback('/models');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    return response.json();
  }

  async testConnection(config: any): Promise<boolean> {
    const response = await this.fetchWithFallback('/test-connection', {
      method: 'POST',
      body: JSON.stringify(config),
    });

    return response.ok;
  }
}

export const apiService = new APIService();