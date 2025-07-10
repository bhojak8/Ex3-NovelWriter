const API_BASE_URLS = [
  'https://localhost:8000',
  'https://127.0.0.1:8000',
  'http://localhost:8000',
  'http://127.0.0.1:8000'
];

let activeBaseUrl: string | null = null;

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
  targetLength: 'short' | 'medium' | 'long';
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
  private async testConnection(baseUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async findWorkingBaseUrl(): Promise<string> {
    if (activeBaseUrl) {
      // Test if the active URL still works
      if (await this.testConnection(activeBaseUrl)) {
        return activeBaseUrl;
      }
      // Reset if it doesn't work anymore
      activeBaseUrl = null;
    }

    for (const baseUrl of API_BASE_URLS) {
      if (await this.testConnection(baseUrl)) {
        activeBaseUrl = baseUrl;
        return baseUrl;
      }
    }

    // If no URL works, throw a detailed error
    throw new Error(
      `Backend server is not reachable. Please ensure the backend server is running on one of the configured ports.`
    );
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    try {
      const baseUrl = await this.findWorkingBaseUrl();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - backend server may be overloaded or unreachable');
        }
        if (error.message.includes('SSL certificate needs to be accepted')) {
          throw new Error('SSL certificate needs to be accepted in browser');
        }
        if (error.message.includes('certificate') || error.message.includes('self-signed') || error.message.includes('NET::ERR_CERT')) {
          throw new Error('SSL certificate needs to be accepted in browser');
        }
      }
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await this.makeRequest('/health');
      const result = await response.json();
      return result;
    } catch (error) {
      // Re-throw with more specific error context
      throw error;
    }
  }

  // Method to get the primary backend URL for user instructions
  getPrimaryBackendUrl(): string {
    return API_BASE_URLS[0]; // Return the primary HTTPS localhost URL
  }

  async getAllProjects(): Promise<NovelProject[]> {
    try {
      const response = await this.makeRequest('/api/projects');
      return await response.json();
    } catch (error) {
      console.error('Failed to get all projects:', error);
      throw error;
    }
  }

  async createProject(projectData: Partial<NovelProject>): Promise<NovelProject> {
    try {
      const response = await this.makeRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, projectData: Partial<NovelProject>): Promise<NovelProject> {
    try {
      const response = await this.makeRequest(`/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await this.makeRequest(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  async generatePremise(genre: string, themes?: string): Promise<{ title: string; premise: string }> {
    try {
      const response = await this.makeRequest('/api/generate/premise', {
        method: 'POST',
        body: JSON.stringify({ genre, themes }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate premise:', error);
      throw error;
    }
  }

  async generateOutline(premise: string, genre: string): Promise<string[]> {
    try {
      const response = await this.makeRequest('/api/generate/outline', {
        method: 'POST',
        body: JSON.stringify({ premise, genre }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate outline:', error);
      throw error;
    }
  }

  async startWritingSession(projectId: string): Promise<WritingSession> {
    try {
      const response = await this.makeRequest(`/api/projects/${projectId}/writing-session`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to start writing session:', error);
      throw error;
    }
  }

  async generateChapterContent(projectId: string, chapterIndex: number): Promise<{ content: string; entities: any }> {
    try {
      const response = await this.makeRequest(`/api/projects/${projectId}/chapters/${chapterIndex}/generate`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate chapter content:', error);
      throw error;
    }
  }

  async exportNovel(projectId: string, format: 'txt' | 'docx' | 'pdf' = 'txt'): Promise<{ content: string; filename: string }> {
    try {
      const response = await this.makeRequest(`/api/projects/${projectId}/export?format=${format}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to export novel:', error);
      throw error;
    }
  }

  async generateContent(prompt: string, options: any = {}) {
    try {
      const response = await this.makeRequest('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, ...options }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to generate content:', error);
      throw error;
    }
  }

  async getModels() {
    try {
      const response = await this.makeRequest('/api/models');
      return await response.json();
    } catch (error) {
      console.error('Failed to get models:', error);
      throw error;
    }
  }

  async testModel(modelConfig: any) {
    try {
      const response = await this.makeRequest('/api/models/test', {
        method: 'POST',
        body: JSON.stringify(modelConfig),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to test model:', error);
      throw error;
    }
  }

  async saveModel(modelConfig: any) {
    try {
      const response = await this.makeRequest('/api/models', {
        method: 'POST',
        body: JSON.stringify(modelConfig),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to save model:', error);
      throw error;
    }
  }

  // Get the currently active base URL for display purposes
  getActiveBaseUrl(): string | null {
    return activeBaseUrl;
  }
}

export const apiService = new APIService();
export default apiService;