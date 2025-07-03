export interface NovelProject {
  id: string;
  title: string;
  genre: string;
  premise: string;
  outline: string[];
  chapters: Chapter[];
  status: 'planning' | 'writing' | 'completed' | 'paused';
  progress: number;
  writingStyle: string;
  targetLength: string;
  themes?: string;
  createdAt: string;
  modifiedAt: string;
  wordCount: number;
}

export interface Chapter {
  id: number;
  title: string;
  content: string;
  summary: string;
  entities: any;
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

class APIService {
  private baseURL: string;
  private isHttps: boolean;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://localhost:8000';
    this.isHttps = this.baseURL.startsWith('https');
  }

  private async fetchWithFallback(url: string, options: RequestInit = {}): Promise<Response> {
    const fullUrl = `${this.baseURL}${url}`;
    
    try {
      // First attempt with original URL
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      // If HTTPS fails, try HTTP fallback
      if (this.isHttps && error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('HTTPS connection failed, trying HTTP fallback...');
        const httpUrl = fullUrl.replace('https://', 'http://').replace(':8000', ':8000');
        
        try {
          const response = await fetch(httpUrl, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          // Update base URL for future requests
          this.baseURL = 'http://localhost:8000';
          this.isHttps = false;
          
          return response;
        } catch (httpError) {
          console.error('Both HTTPS and HTTP connections failed:', httpError);
          throw new Error('Unable to connect to backend server. Please ensure the server is running.');
        }
      }
      
      // Re-throw original error if not a connection issue
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Network request failed');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.fetchWithFallback('/health');
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async getAllProjects(): Promise<NovelProject[]> {
    try {
      const response = await this.fetchWithFallback('/api/projects');
      return await response.json();
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }
  }

  async createProject(projectData: Partial<NovelProject>): Promise<NovelProject> {
    try {
      const response = await this.fetchWithFallback('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      return await response.json();
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
      return await response.json();
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
        body: JSON.stringify({ genre, themes, model_name: modelName }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate premise:', error);
      throw error;
    }
  }

  async generateOutline(premise: string, genre: string, modelName?: string): Promise<string[]> {
    try {
      const response = await this.fetchWithFallback('/api/generate/outline', {
        method: 'POST',
        body: JSON.stringify({ premise, genre, model_name: modelName }),
      });
      return await response.json();
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

  async generateChapterContent(projectId: string, chapterIndex: number, modelName?: string): Promise<{ content: string; entities: any }> {
    try {
      const response = await this.fetchWithFallback('/api/writing/generate-chapter', {
        method: 'POST',
        body: JSON.stringify({ 
          projectId, 
          chapterIndex,
          model_name: modelName
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
}

// Local LLM Service for Ollama integration
class LocalLLMService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_LOCAL_LLM_URL || 'http://localhost:11434';
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateText(prompt: string, model: string = 'llama2'): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Local LLM generation failed:', error);
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

    const response = await this.generateText(prompt, model);
    
    // Parse the response into an array
    const lines = response.split('\n');
    const chapters = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && (trimmed[0]?.match(/\d/) || trimmed.startsWith('-'))) {
        // Remove numbering and clean up
        const chapter = trimmed.split('.', 2)[1]?.trim() || trimmed.replace(/^\d+\.?\s*/, '').replace(/^-\s*/, '');
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
    const styleText = writingStyle === '一' ? 'first person (我)' : 'third person (他/她)';
    const context = previousContext ? `Previous context: ${previousContext}\n\n` : '';
    
    const prompt = `${context}Write a detailed chapter for a ${genre} novel in ${styleText} perspective.

Chapter summary: ${chapterSummary}

Requirements:
- Write 1000-1500 words
- Use proper paragraphs with dialogue and narrative description
- Focus on character development and atmosphere
- Advance the plot meaningfully
- Include sensory details and emotional depth
- Maintain consistent tone and style

Begin writing the chapter:`;

    return await this.generateText(prompt, model);
  }
}

export const apiService = new APIService();
export const localLLMService = new LocalLLMService();