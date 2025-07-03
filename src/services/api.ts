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
  id: string;
  name: string;
  provider: string;
  description?: string;
  contextLength?: number;
  isAvailable: boolean;
}

export interface ModelConfig {
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
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

  constructor() {
    // Use the environment variable for API URL, with HTTP fallback
    this.baseURL = import.meta.env.VITE_API_URL || 'https://localhost:8000';
    this.fallbackURLs = [
      this.baseURL,
      'https://localhost:8000',
      'http://localhost:8000',
      'https://127.0.0.1:8000',
      'http://127.0.0.1:8000'
    ];
  }

  private async testConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        // Add these options to handle SSL issues
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn(`Connection test failed for ${url}:`, error);
      return false;
    }
  }

  private async findWorkingURL(): Promise<string> {
    if (this.workingURL && this.connectionTested) {
      return this.workingURL;
    }

    // Test all URLs to find a working one
    for (const url of this.fallbackURLs) {
      console.log(`Testing connection to: ${url}`);
      if (await this.testConnection(url)) {
        console.log(`✓ Successfully connected to: ${url}`);
        this.workingURL = url;
        this.connectionTested = true;
        return url;
      }
    }

    // If no URL works, throw a descriptive error
    throw new Error(
      'Backend connection failed. Please ensure:\n\n' +
      '1. The backend server is running\n' +
      '2. If using HTTPS, visit https://localhost:8000 in your browser and accept the SSL certificate\n' +
      '3. Check that the server is accessible on the configured port\n\n' +
      `Attempted URLs: ${this.fallbackURLs.join(', ')}`
    );
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
      // Reset connection status on error
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
            top_p: options.topP || 0.9,
            num_predict: options.maxTokens || 1000,
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

    const response = await this.generateText(prompt, model, { maxTokens: 2048 });
    
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

    return this.generateText(prompt, model, { maxTokens: 2048 });
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
        id: model.name,
        name: model.name,
        provider: 'ollama',
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