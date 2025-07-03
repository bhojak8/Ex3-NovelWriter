// Type definitions
export interface NovelProject {
  id: string;
  title: string;
  description: string;
  genre: string;
  targetLength: number;
  currentLength: number;
  chapters: Chapter[];
  characters: Character[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WritingSession {
  id: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  wordsWritten: number;
  chaptersCompleted: string[];
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
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  isCompleted: boolean;
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

  async getAllProjects(): Promise<NovelProject[]> {
    try {
      const response = await this.fetchWithFallback('/api/projects');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const projects = await response.json();
      return projects.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt)
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

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }

      const project = await response.json();
      return {
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt)
      };
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async generatePremise(prompt: string, options: any = {}): Promise<string> {
    try {
      const response = await this.fetchWithFallback('/api/generate/premise', {
        method: 'POST',
        body: JSON.stringify({ prompt, ...options }),
      });

      if (!response.ok) {
        throw new Error(`Premise generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.premise || data.response || '';
    } catch (error) {
      console.error('Failed to generate premise:', error);
      throw error;
    }
  }

  async generateOutline(projectData: Partial<NovelProject>, options: any = {}): Promise<string> {
    try {
      const response = await this.fetchWithFallback('/api/generate/outline', {
        method: 'POST',
        body: JSON.stringify({ project: projectData, ...options }),
      });

      if (!response.ok) {
        throw new Error(`Outline generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.outline || data.response || '';
    } catch (error) {
      console.error('Failed to generate outline:', error);
      throw error;
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

  async getAvailableModels(): Promise<any[]> {
    const response = await this.fetchWithFallback('/models');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    return response.json();
  }

  async getModels(): Promise<any[]> {
    return this.getAvailableModels();
  }

  async testConnection(config: any): Promise<boolean> {
    const response = await this.fetchWithFallback('/test-connection', {
      method: 'POST',
      body: JSON.stringify(config),
    });

    return response.ok;
  }
}

class LocalLLMService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_LOCAL_LLM_URL || 'http://localhost:11434';
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      return response.ok;
    } catch (error) {
      console.warn('Local LLM health check failed:', error);
      return false;
    }
  }

  async generateText(prompt: string, model: string = 'llama2', options: Partial<ModelConfig> = {}): Promise<string> {
    try {
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
      });

      if (!response.ok) {
        throw new Error(`Local LLM generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Local LLM generation error:', error);
      throw error;
    }
  }

  async generateOutline(project: Partial<NovelProject>, model: string = 'llama2'): Promise<string> {
    const prompt = `Create a detailed outline for a ${project.genre} novel titled "${project.title}".

Description: ${project.description}

Target length: ${project.targetLength} words

Please provide a structured outline with:
1. Main plot points
2. Character arcs
3. Chapter breakdown
4. Key themes

Outline:`;

    return this.generateText(prompt, model);
  }

  async generateChapterContent(
    chapterTitle: string,
    outline: string,
    previousChapters: string,
    characters: Character[],
    model: string = 'llama2'
  ): Promise<string> {
    const characterInfo = characters.map(c => `${c.name}: ${c.description}`).join('\n');
    
    const prompt = `Write a chapter titled "${chapterTitle}" for a novel.

Outline context:
${outline}

Previous chapters summary:
${previousChapters}

Characters:
${characterInfo}

Write an engaging chapter that advances the plot and develops the characters. Focus on:
- Compelling dialogue
- Vivid descriptions
- Character development
- Plot progression

Chapter content:`;

    return this.generateText(prompt, model, { maxTokens: 2000 });
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
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