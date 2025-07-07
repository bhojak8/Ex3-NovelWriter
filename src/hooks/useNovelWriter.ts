import { useState, useCallback } from 'react';
import { apiService, NovelProject, WritingSession } from '../services/api';
import { localLLMService } from '../services/localLLM';

export type LLMProvider = 'ex3-api' | 'local-llm';

export function useNovelWriter() {
  const [currentProject, setCurrentProject] = useState<NovelProject | null>(null);
  const [writingSession, setWritingSession] = useState<WritingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llmProvider, setLLMProvider] = useState<LLMProvider>('ex3-api');
  const [isConnected, setIsConnected] = useState(false);
  const [isLocalLLMConnected, setIsLocalLLMConnected] = useState(false);

  // Local storage for projects when using local LLM
  const [localProjects, setLocalProjects] = useState<NovelProject[]>(() => {
    const stored = localStorage.getItem('ex3-novel-projects');
    return stored ? JSON.parse(stored) : [];
  });

  const saveToLocalStorage = useCallback((projects: NovelProject[]) => {
    localStorage.setItem('ex3-novel-projects', JSON.stringify(projects));
    setLocalProjects(projects);
  }, []);

  // Check API connectivity
  const checkConnection = useCallback(async () => {
    try {
      const connected = await apiService.checkHealth();
      setIsConnected(connected);
      return connected;
    } catch (err) {
      setIsConnected(false);
      // Re-throw the error so it can be handled by the calling component
      throw err;
    }
  }, []);

  // Check Local LLM connectivity
  const checkLocalLLMConnection = useCallback(async () => {
    try {
      const connected = await localLLMService.checkHealth();
      setIsLocalLLMConnected(connected);
      return connected;
    } catch {
      setIsLocalLLMConnected(false);
      return false;
    }
  }, []);

  // Enhanced provider setter with connection checks
  const setLLMProviderWithCheck = useCallback(async (provider: LLMProvider) => {
    setLLMProvider(provider);
    if (provider === 'ex3-api') {
      await checkConnection();
    } else if (provider === 'local-llm') {
      await checkLocalLLMConnection();
    }
  }, [checkConnection, checkLocalLLMConnection]);

  const getAllProjects = useCallback(async () => {
    if (llmProvider === 'local-llm') {
      return localProjects;
    }
    
    try {
      return await apiService.getAllProjects();
    } catch (err) {
      console.error('Failed to get projects:', err);
      return localProjects; // Fallback to local
    }
  }, [llmProvider, localProjects]);

  const createProject = useCallback(async (projectData: Partial<NovelProject>) => {
    setIsLoading(true);
    setError(null);
    try {
      let project: NovelProject;
      
      if (llmProvider === 'ex3-api' && isConnected) {
        project = await apiService.createProject(projectData);
      } else {
        // Create project locally
        project = {
          id: Date.now().toString(),
          title: projectData.title || 'Untitled Novel',
          genre: projectData.genre || 'Fantasy',
          premise: projectData.premise || '',
          outline: [],
          chapters: [],
          status: 'planning',
          progress: 0,
          writingStyle: projectData.writingStyle || '三',
          targetLength: projectData.targetLength || 'medium',
          themes: projectData.themes,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          wordCount: 0
        };
        
        const updatedProjects = [...localProjects, project];
        saveToLocalStorage(updatedProjects);
      }
      
      setCurrentProject(project);
      return project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [llmProvider, isConnected, localProjects, saveToLocalStorage]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<NovelProject>) => {
    try {
      let updatedProject: NovelProject;
      
      if (llmProvider === 'ex3-api' && isConnected) {
        updatedProject = await apiService.updateProject(projectId, updates);
      } else {
        // Update locally
        const projectIndex = localProjects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) throw new Error('Project not found');
        
        updatedProject = {
          ...localProjects[projectIndex],
          ...updates,
          modifiedAt: new Date().toISOString()
        };
        
        const updatedProjects = [...localProjects];
        updatedProjects[projectIndex] = updatedProject;
        saveToLocalStorage(updatedProjects);
      }
      
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [llmProvider, isConnected, localProjects, currentProject, saveToLocalStorage]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      if (llmProvider === 'ex3-api' && isConnected) {
        await apiService.deleteProject(projectId);
      }
      
      // Always remove from local storage
      const updatedProjects = localProjects.filter(p => p.id !== projectId);
      saveToLocalStorage(updatedProjects);
      
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [llmProvider, isConnected, localProjects, currentProject, saveToLocalStorage]);

  const generatePremise = useCallback(async (genre: string, themes?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (llmProvider === 'ex3-api' && isConnected) {
        return await apiService.generatePremise(genre, themes);
      } else if (llmProvider === 'local-llm' && isLocalLLMConnected) {
        const prompt = `Generate a compelling premise for a ${genre} novel${themes ? ` incorporating themes of ${themes}` : ''}. Include both a title and a detailed premise.`;
        const response = await localLLMService.generateText(prompt);
        
        // Parse title and premise from response
        const lines = response.split('\n').filter(line => line.trim());
        const titleLine = lines.find(line => line.toLowerCase().includes('title'));
        const premiseLine = lines.find(line => line.toLowerCase().includes('premise'));
        
        return {
          title: titleLine ? titleLine.replace(/title:?\s*/i, '').trim() : `A ${genre} Tale`,
          premise: premiseLine ? premiseLine.replace(/premise:?\s*/i, '').trim() : response
        };
      } else {
        throw new Error(
          llmProvider === 'ex3-api' 
            ? 'Ex3 API is not connected. Please check your connection.'
            : 'Local LLM is not available. Please ensure Ollama is running.'
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate premise';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [llmProvider, isConnected, isLocalLLMConnected]);

  const generateOutline = useCallback(async (premise: string, genre: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let outline: string[];
      
      if (llmProvider === 'ex3-api' && isConnected) {
        outline = await apiService.generateOutline(premise, genre);
      } else if (llmProvider === 'local-llm' && isLocalLLMConnected) {
        outline = await localLLMService.generateOutline(premise, genre);
      } else {
        throw new Error(
          llmProvider === 'ex3-api' 
            ? 'Ex3 API is not connected. Please check your connection.'
            : 'Local LLM is not available. Please ensure Ollama is running.'
        );
      }
      
      if (currentProject) {
        const updatedProject = await updateProject(currentProject.id, { outline });
        setCurrentProject(updatedProject);
      }
      
      return outline;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate outline';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, llmProvider, isConnected, isLocalLLMConnected, updateProject]);

  const startWriting = useCallback(async () => {
    if (!currentProject) return;
    
    setIsLoading(true);
    setError(null);
    try {
      let session: WritingSession;
      
      if (llmProvider === 'ex3-api' && isConnected) {
        session = await apiService.startWritingSession(currentProject.id);
      } else {
        // Create local session
        session = {
          id: Date.now().toString(),
          projectId: currentProject.id,
          currentChapter: 0,
          isActive: true,
          generatedContent: '',
          entityDatabase: {}
        };
      }
      
      setWritingSession(session);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start writing session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, llmProvider, isConnected]);

  const generateChapter = useCallback(async (chapterIndex: number) => {
    if (!currentProject || !writingSession) return;
    
    setIsLoading(true);
    setError(null);
    try {
      let result: { content: string; entities: any };
      
      if (llmProvider === 'ex3-api' && isConnected) {
        result = await apiService.generateChapterContent(currentProject.id, chapterIndex);
      } else if (llmProvider === 'local-llm' && isLocalLLMConnected) {
        // Generate using local LLM
        const chapterSummary = currentProject.outline[chapterIndex];
        const previousContext = chapterIndex > 0 ? 
          currentProject.chapters[chapterIndex - 1]?.content || '' : '';
        
        const content = await localLLMService.generateChapterContent(
          chapterSummary,
          previousContext,
          currentProject.genre,
          currentProject.writingStyle
        );
        
        // Extract entities (simplified for local generation)
        const characters = extractCharacters(content);
        const locations = extractLocations(content);
        
        result = {
          content,
          entities: { characters, locations }
        };
      } else {
        throw new Error(
          llmProvider === 'ex3-api' 
            ? 'Ex3 API is not connected. Please check your connection.'
            : 'Local LLM is not available. Please ensure Ollama is running.'
        );
      }
      
      // Update project with new chapter content
      const updatedChapters = [...(currentProject.chapters || [])];
      updatedChapters[chapterIndex] = {
        id: chapterIndex,
        title: `Chapter ${chapterIndex + 1}`,
        content: result.content,
        summary: currentProject.outline[chapterIndex],
        entities: result.entities,
        wordCount: result.content.split(' ').length
      };
      
      const totalWords = updatedChapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
      const progress = ((chapterIndex + 1) / currentProject.outline.length) * 100;
      
      const updatedProject = await updateProject(currentProject.id, {
        chapters: updatedChapters,
        progress,
        wordCount: totalWords,
        status: chapterIndex === currentProject.outline.length - 1 ? 'completed' : 'writing'
      });
      
      setCurrentProject(updatedProject);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chapter';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, writingSession, llmProvider, isConnected, isLocalLLMConnected, updateProject]);

  const exportNovel = useCallback(async (format: 'txt' | 'docx' | 'pdf' = 'txt') => {
    if (!currentProject) return;
    
    try {
      if (llmProvider === 'ex3-api' && isConnected) {
        return await apiService.exportNovel(currentProject.id, format);
      } else {
        // Local export
        const content = [
          `Title: ${currentProject.title}`,
          `Genre: ${currentProject.genre}`,
          `Premise: ${currentProject.premise}`,
          '',
          ...currentProject.chapters.map((chapter, index) => 
            `Chapter ${index + 1}: ${chapter.title}\n\n${chapter.content}`
          )
        ].join('\n\n');
        
        return {
          content,
          filename: `${currentProject.title}.${format}`
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export novel';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [currentProject, llmProvider, isConnected]);

  return {
    currentProject,
    writingSession,
    isLoading,
    error,
    llmProvider,
    isConnected,
    isLocalLLMConnected,
    setLLMProvider: setLLMProviderWithCheck,
    checkConnection,
    checkLocalLLMConnection,
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    generatePremise,
    generateOutline,
    startWriting,
    generateChapter,
    exportNovel,
    setCurrentProject,
    setError
  };
}

// Helper functions for local entity extraction
function extractCharacters(content: string): string[] {
  const characters = new Set<string>();
  
  // Simple regex patterns to find character names
  const namePatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, // Capitalized names
    /"([^"]+)"/g, // Quoted speech (potential character dialogue)
  ];
  
  namePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.replace(/[""]/g, '').trim();
        if (cleaned.length > 2 && cleaned.length < 30) {
          characters.add(cleaned);
        }
      });
    }
  });
  
  return Array.from(characters).slice(0, 10); // Limit to 10 characters
}

function extractLocations(content: string): string[] {
  const locations = new Set<string>();
  
  // Common location indicators
  const locationKeywords = ['at', 'in', 'near', 'by', 'through', 'across', 'into', 'onto'];
  
  locationKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\s+(?:the\\s+)?([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)`, 'g');
    const matches = content.match(regex);
    if (matches) {
      matches.forEach(match => {
        const location = match.replace(new RegExp(`^${keyword}\\s+(?:the\\s+)?`, 'i'), '').trim();
        if (location.length > 2 && location.length < 30) {
          locations.add(location);
        }
      });
    }
  });
  
  return Array.from(locations).slice(0, 10); // Limit to 10 locations
}