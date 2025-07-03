// Enhanced API service for real Ex3 backend integration
export interface NovelProject {
  id: string;
  title: string;
  genre: string;
  premise: string;
  outline: string[];
  chapters: Chapter[];
  status: 'planning' | 'writing' | 'completed';
  progress: number;
  writingStyle: '一' | '三';
  targetLength: 'short' | 'medium' | 'long';
  themes?: string;
}

export interface Chapter {
  id: number;
  title: string;
  content: string;
  summary: string;
  entities: {
    characters: string[];
    locations: string[];
  };
}

export interface WritingSession {
  id: string;
  projectId: string;
  currentChapter: number;
  isActive: boolean;
  generatedContent: string;
  entityDatabase: Record<string, string>;
}

export interface GenerationResult {
  content: string;
  entities: {
    characters: string[];
    locations: string[];
  };
}

class Ex3ApiService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }
    return response.json();
  }

  // Project Management
  async createProject(projectData: Partial<NovelProject>): Promise<NovelProject> {
    const response = await fetch(`${this.baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    return this.handleResponse<NovelProject>(response);
  }

  async getProject(id: string): Promise<NovelProject> {
    const response = await fetch(`${this.baseUrl}/api/projects/${id}`);
    return this.handleResponse<NovelProject>(response);
  }

  async updateProject(id: string, updates: Partial<NovelProject>): Promise<NovelProject> {
    const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return this.handleResponse<NovelProject>(response);
  }

  // AI Generation - Real API calls
  async generateOutline(premise: string, genre: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/generate/outline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ premise, genre })
    });
    const data = await this.handleResponse<string[]>(response);
    return Array.isArray(data) ? data : [data];
  }

  async generatePremise(genre: string, themes?: string): Promise<{ premise: string; title: string }> {
    const response = await fetch(`${this.baseUrl}/api/generate/premise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre, themes })
    });
    return this.handleResponse<{ premise: string; title: string }>(response);
  }

  // Writing Process - Real generation
  async startWritingSession(projectId: string): Promise<WritingSession> {
    const response = await fetch(`${this.baseUrl}/api/writing/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId })
    });
    return this.handleResponse<WritingSession>(response);
  }

  async generateChapterContent(
    projectId: string, 
    chapterIndex: number,
    previousContext?: string
  ): Promise<GenerationResult> {
    const response = await fetch(`${this.baseUrl}/api/writing/generate-chapter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, chapterIndex, previousContext })
    });
    return this.handleResponse<GenerationResult>(response);
  }

  // Export functionality
  async exportNovel(projectId: string, format: 'txt' | 'docx' | 'pdf' = 'txt'): Promise<{ content: string; filename: string }> {
    const response = await fetch(`${this.baseUrl}/api/export/${projectId}?format=${format}`);
    return this.handleResponse<{ content: string; filename: string }>(response);
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Alternative local LLM service
class LocalLLMService {
  private baseUrl = import.meta.env.VITE_LOCAL_LLM_URL || 'http://localhost:11434'; // Ollama default

  async generateText(prompt: string, model: string = 'llama2'): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Local LLM Error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  async generateOutline(premise: string, genre: string): Promise<string[]> {
    const prompt = `Create a detailed chapter outline for a ${genre} novel with the following premise:

${premise}

Generate 8-12 chapter summaries, each 1-2 sentences long. Format as a numbered list.`;

    const response = await this.generateText(prompt);
    
    // Parse the response into an array
    const lines = response.split('\n').filter(line => line.trim());
    const chapters = lines
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
    
    return chapters.length > 0 ? chapters : [response];
  }

  async generateChapterContent(
    chapterSummary: string,
    previousContext: string = '',
    genre: string,
    writingStyle: string = '三'
  ): Promise<string> {
    const styleText = writingStyle === '一' ? 'first person (我)' : 'third person (他/她)';
    
    const prompt = `Write a detailed chapter for a ${genre} novel in ${styleText} perspective.

${previousContext ? `Previous context: ${previousContext}` : ''}

Chapter summary: ${chapterSummary}

Write 800-1200 words with proper paragraphs, dialogue, and narrative description. Focus on character development, atmosphere, and advancing the plot.`;

    return this.generateText(prompt);
  }
}

export const apiService = new Ex3ApiService();
export const localLLMService = new LocalLLMService();