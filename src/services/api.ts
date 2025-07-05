// Type definitions
export interface NovelProject {
  id: string;
  title: string;
  description?: string;
  genre: string;
  premise: string;
  outline: string[];
  chapters: Chapter[];
  status: string;
  progress: number;
  writingStyle: string;
  targetLength: string;
  themes?: string;
  createdAt: string;
  modifiedAt: string;
  wordCount: number;
}

export interface WritingSession {
  id: string;
  projectId: string;
  currentChapter: number;
  isActive: boolean;
  generatedContent: string;
  entityDatabase: any;
}

export interface ModelInfo {
  name: string;
  provider: string;
  model: string;
  type: string;
  local: boolean;
  supports_system_prompt: boolean;
  description?: string;
  contextLength?: number;
  isAvailable: boolean;
}

export interface ModelConfig {
  name: string;
  provider: string;
  model_id: string;
  api_key?: string;
  base_url?: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  top_k: number;
  custom_params: Record<string, any>;
}

export interface Chapter {
  id: number;
  title: string;
  content: string;
  summary: string;
  entities: any;
  wordCount: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  traits: string[];
}

class APIService {
  private baseURL: string;
  private fallbackURLs: string[];
  private connectionTested: boolean = false;
  private workingURL: string | null = null;
  private lastError: string | null = null;

  constructor() {
    // Use the environment variable for API URL, with proper fallback order
    const envURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.baseURL = envURL;
    
    // Try HTTP first to avoid SSL issues, then HTTPS
    this.fallbackURLs = [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'https://localhost:8000',
      'https://127.0.0.1:8000'
    ];
    
    // If environment specifies a specific URL, try it first
    if (envURL && !this.fallbackURLs.includes(envURL)) {
      this.fallbackURLs.unshift(envURL);
    }
  }

  private async testConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout for better reliability
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // Store the last error for better error reporting
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Connection test failed for ${url}:`, error);
      return false;
    }
  }

  private async findWorkingURL(): Promise<string> {
    if (this.workingURL && this.connectionTested) {
      // Re-test the working URL to ensure it's still working
      if (await this.testConnection(this.workingURL)) {
        return this.workingURL;
      } else {
        // Reset if the previously working URL is no longer working
        this.workingURL = null;
        this.connectionTested = false;
      }
    }

    let httpFailed = false;
    let httpsFailed = false;
    let sslError = false;

    // Test all URLs to find a working one
    for (const url of this.fallbackURLs) {
      console.log(`Testing connection to: ${url}`);
      if (await this.testConnection(url)) {
        console.log(`✓ Successfully connected to: ${url}`);
        this.workingURL = url;
        this.connectionTested = true;
        return url;
      } else {
        // Track what types of connections failed
        if (url.startsWith('http://')) {
          httpFailed = true;
        } else if (url.startsWith('https://')) {
          httpsFailed = true;
          // Check if the error suggests SSL issues
          if (this.lastError && (
            this.lastError.includes('Failed to fetch') ||
            this.lastError.includes('SSL') ||
            this.lastError.includes('certificate') ||
            this.lastError.includes('net::ERR_CERT') ||
            this.lastError.includes('CERT_')
          )) {
            sslError = true;
          }
        }
      }
    }

    // Generate specific error message based on what failed
    let errorMessage = 'Backend connection failed. ';

    if (httpFailed && httpsFailed && sslError) {
      errorMessage += 'The backend server appears to be running with HTTPS and a self-signed SSL certificate that your browser does not trust.\n\n';
      errorMessage += 'To fix this:\n';
      errorMessage += '1. Open https://localhost:8000 in a new browser tab\n';
      errorMessage += '2. You will see a security warning - this is normal for self-signed certificates\n';
      errorMessage += '3. Click "Advanced" or "Show details" on the warning page\n';
      errorMessage += '4. Click "Proceed to localhost (unsafe)" or "Accept the risk and continue"\n';
      errorMessage += '5. You should see a JSON response like {"status": "healthy"}\n';
      errorMessage += '6. Return to this application and refresh the page\n\n';
      errorMessage += 'This is a one-time setup required for self-signed certificates.';
    } else if (httpFailed && !httpsFailed) {
      errorMessage += 'HTTP connections failed but HTTPS might be available. Please ensure:\n\n';
      errorMessage += '1. The backend server is running\n';
      errorMessage += '2. The server is configured to accept HTTP connections\n';
      errorMessage += '3. No firewall is blocking the connection\n';
      errorMessage += '4. The port 8000 is available and not in use by another service';
    } else {
      errorMessage += 'Please ensure:\n\n';
      errorMessage += '1. The backend server is running\n';
      errorMessage += '2. The server is accessible on the configured port\n';
      errorMessage += '3. No firewall is blocking the connection\n';
      errorMessage += '4. The VITE_API_URL environment variable is correct if set';
    }

    errorMessage += `\n\nAttempted URLs: ${this.fallbackURLs.join(', ')}`;
    
    if (this.lastError) {
      errorMessage += `\nLast error: ${this.lastError}`;
    }
    
    throw new Error(errorMessage);
  }

  private async fetchWithFallback(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const workingURL = await this.findWorkingURL();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${workingURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      // Reset connection status on error to force re-testing
      this.connectionTested = false;
      this.workingURL = null;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - the server may be overloaded or unreachable');
        }
        
        throw new Error(`Backend request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.findWorkingURL();
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async getAllProjects(): Promise<NovelProject[]> {
    try {
      const response = await this.fetchWithFallback('/api/projects');
      const projects = await response.json();
      
      return projects.map((project: any) => ({
        ...project,
        chapters: project.chapters || [],
        outline: project.outline || [],
        wordCount: project.wordCount || 0,
        progress: project.progress || 0
      }));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  }

  async createProject(projectData: Partial<NovelProject>): Promise<NovelProject> {
    try {
      const response = await this.fetchWithFallback('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });

      const project = await response.json();
      return {
        ...project,
        chapters: project.chapters || [],
        outline: project.outline || [],
        wordCount: project.wordCount || 0,
        progress: project.progress || 0
      };
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<NovelProject>): Promise<NovelProject> {
    try {
      const response = await this.fetchWithFallback(`/api/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      const project = await response.json();
      return {
        ...project,
        chapters: project.chapters || [],
        outline: project.outline || [],
        wordCount: project.wordCount || 0,
        progress: project.progress || 0
      };
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      await this.fetchWithFallback(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  async generatePremise(genre: string, themes?: string, modelName?: string): Promise<{ title: string; premise: string }> {
    try {
      const response = await this.fetchWithFallback('/api/generate/premise', {
        method: 'POST',
        body: JSON.stringify({ 
          genre, 
          themes,
          model_name: modelName || 'gpt-3.5-turbo'
        }),
      });

      const data = await response.json();
      return {
        title: data.title || `A ${genre} Tale`,
        premise: data.premise || data.response || ''
      };
    } catch (error) {
      console.error('Failed to generate premise:', error);
      throw error;
    }
  }

  async generateOutline(premise: string, genre: string, modelName?: string): Promise<string[]> {
    try {
      const response = await this.fetchWithFallback('/api/generate/outline', {
        method: 'POST',
        body: JSON.stringify({ 
          premise, 
          genre,
          model_name: modelName || 'gpt-3.5-turbo'
        }),
      });

      const data = await response.json();
      return Array.isArray(data) ? data : [data.outline || data.response || ''];
    } catch (error) {
      console.error('Failed to generate outline:', error);
      throw error;
    }
  }

  async startWritingSession(projectId: string): Promise<WritingSession> {
    try {
      const response = await this.fetchWithFallback('/api/writing/start', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to start writing session:', error);
      throw error;
    }
  }

  async generateChapterContent(
    projectId: string, 
    chapterIndex: number, 
    previousContext?: string,
    modelName?: string
  ): Promise<{ content: string; entities: any }> {
    try {
      const response = await this.fetchWithFallback('/api/writing/generate-chapter', {
        method: 'POST',
        body: JSON.stringify({ 
          projectId, 
          chapterIndex, 
          previousContext,
          model_name: modelName || 'gpt-3.5-turbo'
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to generate chapter content:', error);
      throw error;
    }
  }

  async exportNovel(projectId: string, format: string = 'txt'): Promise<{ content: string; filename: string }> {
    try {
      const response = await this.fetchWithFallback(`/api/export/${projectId}?format=${format}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to export novel:', error);
      throw error;
    }
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.fetchWithFallback('/api/models');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return [];
    }
  }

  async checkAllModelsHealth(): Promise<Record<string, boolean>> {
    try {
      const response = await this.fetchWithFallback('/api/models/health/all');
      return await response.json();
    } catch (error) {
      console.error('Failed to check models health:', error);
      return {};
    }
  }

  async scanLocalProviders(): Promise<Record<string, any>> {
    try {
      const response = await this.fetchWithFallback('/api/models/scan');
      return await response.json();
    } catch (error) {
      console.error('Failed to scan local providers:', error);
      return {};
    }
  }

  async addModel(config: ModelConfig): Promise<void> {
    try {
      await this.fetchWithFallback('/api/models', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error('Failed to add model:', error);
      throw error;
    }
  }

  async removeModel(modelName: string): Promise<void> {
    try {
      await this.fetchWithFallback(`/api/models/${modelName}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to remove model:', error);
      throw error;
    }
  }
}

class LocalLLMService {
  private baseURL: string;
  private connectionTested: boolean = false;

  constructor() {
    this.baseURL = import.meta.env.VITE_LOCAL_LLM_URL || 'http://localhost:11434';
  }

  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseURL}/api/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      this.connectionTested = response.ok;
      return response.ok;
    } catch (error) {
      console.warn('Local LLM health check failed:', error);
      this.connectionTested = false;
      return false;
    }
  }

  async generateText(prompt: string, model: string = 'llama2', options: Partial<ModelConfig> = {}): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for generation
      
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            num_predict: options.max_tokens || 1000,
          },
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Local LLM generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Local LLM request timeout - the model may be too large or the system overloaded');
      }
      console.error('Local LLM generation error:', error);
      throw error;
    }
  }

  async generateOutline(premise: string, genre: string, model: string = 'llama2'): Promise<string[]> {
    const prompt = `Create a detailed chapter outline for a ${genre} novel with the following premise:

${premise}

Generate 8-12 chapter summaries, each 1-2 sentences long. Format as a numbered list:

1. Chapter title - Brief description
2. Chapter title - Brief description
...

Focus on story progression, character development, and maintaining reader engagement.`;

    const response = await this.generateText(prompt, model, { max_tokens: 2048 });
    
    // Parse the response into an array
    const lines = response.split('\n');
    const chapters = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && (trimmed[0]?.match(/\d/) || trimmed.startsWith('-'))) {
        // Remove numbering and clean up
        const chapter = trimmed.split('.', 1)[1]?.trim() || trimmed.replace(/^\d+\.?\s*/, '').replace(/^-\s*/, '');
        if (chapter) {
          chapters.push(chapter);
        }
      }
    }
    
    return chapters.length > 0 ? chapters : [response];
  }

  async generateChapterContent(
    chapterSummary: string,
    previousContext: string,
    genre: string,
    writingStyle: string,
    model: string = 'llama2'
  ): Promise<string> {
    const styleText = writingStyle === "一" ? "first person (我)" : "third person (他/她)";
    
    const prompt = `${previousContext ? `Previous context: ${previousContext}\n\n` : ''}Write a detailed chapter for a ${genre} novel in ${styleText} perspective.

Chapter summary: ${chapterSummary}

Requirements:
- Write 1000-1500 words
- Use proper paragraphs with dialogue and narrative description
- Focus on character development and atmosphere
- Advance the plot meaningfully
- Include sensory details and emotional depth
- Maintain consistent tone and style

Begin writing the chapter:`;

    return this.generateText(prompt, model, { max_tokens: 2048 });
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${this.baseURL}/api/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      return data.models?.map((model: any) => ({
        name: model.name,
        provider: 'ollama',
        model: model.name,
        type: 'local',
        local: true,
        supports_system_prompt: true,
        description: model.details?.family || 'Local LLM model',
        contextLength: model.details?.parameter_size || undefined,
        isAvailable: true,
      })) || [];
    } catch (error) {
      console.error('Failed to fetch local models:', error);
      return [];
    }
  }
}

export const apiService = new APIService();
export const localLLMService = new LocalLLMService();