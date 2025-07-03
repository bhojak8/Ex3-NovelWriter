// Enhanced API service for real Ex3 backend integration
export interface NovelProject {
  id: string;
  title: string;
  genre: string;
  premise: string;
  outline: string[];
  chapters: Chapter[];
  status: 'planning' | 'writing' | 'completed' | 'paused';
  progress: number;
  writingStyle: '一' | '三';
  targetLength: 'short' | 'medium' | 'long' | 'epic';
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
  entities: {
    characters: string[];
    locations: string[];
  };
  wordCount: number;
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
  async getAllProjects(): Promise<NovelProject[]> {
    const response = await fetch(`${this.baseUrl}/api/projects`);
    return this.handleResponse<NovelProject[]>(response);
  }

  async createProject(projectData: Partial<NovelProject>): Promise<NovelProject> {
    const response = await fetch(`${this.baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...projectData,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        wordCount: 0
      })
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
      body: JSON.stringify({
        ...updates,
        modifiedAt: new Date().toISOString()
      })
    });
    return this.handleResponse<NovelProject>(response);
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.status}`);
    }
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
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Enhanced local LLM service with better error handling
class LocalLLMService {
  public baseUrl = import.meta.env.VITE_LOCAL_LLM_URL || 'http://localhost:11434'; // Ollama default

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateText(prompt: string, model: string = 'llama2'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.8,
            top_p: 0.9,
            top_k: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Local LLM Error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Local LLM generation failed:', error);
      throw new Error('Local LLM is not available. Please ensure Ollama is running.');
    }
  }

  async generateOutline(premise: string, genre: string): Promise<string[]> {
    const prompt = `Create a detailed chapter outline for a ${genre} novel with the following premise:

${premise}

Generate 8-12 chapter summaries, each 1-2 sentences long. Format as a numbered list:

1. Chapter title - Brief description
2. Chapter title - Brief description
...

Focus on story progression, character development, and maintaining reader engagement.`;

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

${previousContext ? `Previous context: ${previousContext.slice(-500)}...` : ''}

Chapter summary: ${chapterSummary}

Requirements:
- Write 1000-1500 words
- Use proper paragraphs with dialogue and narrative description
- Focus on character development and atmosphere
- Advance the plot meaningfully
- Include sensory details and emotional depth
- Maintain consistent tone and style

Begin writing the chapter:`;

    return this.generateText(prompt);
  }

  async generateCharacterProfile(name: string, role: string, genre: string): Promise<string> {
    const prompt = `Create a detailed character profile for a ${genre} novel:

Character Name: ${name}
Role: ${role}

Include:
- Physical appearance
- Personality traits
- Background/history
- Motivations and goals
- Strengths and weaknesses
- Relationships with other characters
- Character arc potential

Write a comprehensive character profile:`;

    return this.generateText(prompt);
  }

  async improvePlotPoint(currentPlot: string, genre: string): Promise<string> {
    const prompt = `Improve and expand this plot point for a ${genre} novel:

Current plot: ${currentPlot}

Suggestions:
- Add more tension and conflict
- Develop character motivations
- Include unexpected twists
- Enhance emotional stakes
- Improve pacing and flow

Provide an improved version:`;

    return this.generateText(prompt);
  }
}

export const apiService = new Ex3ApiService();
export const localLLMService = new LocalLLMService();