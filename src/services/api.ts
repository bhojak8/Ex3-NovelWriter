// API service for connecting to the Ex3 backend
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
  projectId: string;
  currentChapter: number;
  isActive: boolean;
  generatedContent: string;
  entityDatabase: Record<string, string>;
}

class Ex3ApiService {
  private baseUrl = process.env.VITE_API_URL || 'http://localhost:8000';

  // Project Management
  async createProject(projectData: Partial<NovelProject>): Promise<NovelProject> {
    const response = await fetch(`${this.baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    return response.json();
  }

  async getProject(id: string): Promise<NovelProject> {
    const response = await fetch(`${this.baseUrl}/api/projects/${id}`);
    return response.json();
  }

  async updateProject(id: string, updates: Partial<NovelProject>): Promise<NovelProject> {
    const response = await fetch(`${this.baseUrl}/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  // AI Generation
  async generateOutline(premise: string, genre: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/generate/outline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ premise, genre })
    });
    return response.json();
  }

  async generatePremise(genre: string, themes?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate/premise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre, themes })
    });
    const data = await response.json();
    return data.premise;
  }

  // Writing Process
  async startWritingSession(projectId: string): Promise<WritingSession> {
    const response = await fetch(`${this.baseUrl}/api/writing/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId })
    });
    return response.json();
  }

  async generateChapterContent(
    projectId: string, 
    chapterIndex: number,
    previousContext?: string
  ): Promise<{ content: string; entities: any }> {
    const response = await fetch(`${this.baseUrl}/api/writing/generate-chapter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, chapterIndex, previousContext })
    });
    return response.json();
  }

  async pauseWritingSession(sessionId: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/writing/pause/${sessionId}`, {
      method: 'POST'
    });
  }

  // Export functionality
  async exportNovel(projectId: string, format: 'txt' | 'docx' | 'pdf'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/export/${projectId}?format=${format}`);
    return response.blob();
  }
}

export const apiService = new Ex3ApiService();