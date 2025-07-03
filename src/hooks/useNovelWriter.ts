import { useState, useCallback } from 'react';
import { apiService, localLLMService, NovelProject, WritingSession } from '../services/api';

export type LLMProvider = 'ex3-api' | 'local-llm';

export function useNovelWriter() {
  const [currentProject, setCurrentProject] = useState<NovelProject | null>(null);
  const [writingSession, setWritingSession] = useState<WritingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llmProvider, setLLMProvider] = useState<LLMProvider>('ex3-api');
  const [isConnected, setIsConnected] = useState(false);

  // Check API connectivity
  const checkConnection = useCallback(async () => {
    try {
      const connected = await apiService.checkHealth();
      setIsConnected(connected);
      return connected;
    } catch {
      setIsConnected(false);
      return false;
    }
  }, []);

  const createProject = useCallback(async (projectData: Partial<NovelProject>) => {
    setIsLoading(true);
    setError(null);
    try {
      let project: NovelProject;
      
      if (llmProvider === 'ex3-api') {
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
          themes: projectData.themes
        };
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
  }, [llmProvider]);

  const generatePremise = useCallback(async (genre: string, themes?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (llmProvider === 'ex3-api') {
        return await apiService.generatePremise(genre, themes);
      } else {
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
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate premise';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [llmProvider]);

  const generateOutline = useCallback(async (premise: string, genre: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let outline: string[];
      
      if (llmProvider === 'ex3-api') {
        outline = await apiService.generateOutline(premise, genre);
      } else {
        outline = await localLLMService.generateOutline(premise, genre);
      }
      
      if (currentProject) {
        const updatedProject = { ...currentProject, outline };
        setCurrentProject(updatedProject);
        
        if (llmProvider === 'ex3-api') {
          await apiService.updateProject(currentProject.id, { outline });
        }
      }
      
      return outline;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate outline';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, llmProvider]);

  const startWriting = useCallback(async () => {
    if (!currentProject) return;
    
    setIsLoading(true);
    setError(null);
    try {
      let session: WritingSession;
      
      if (llmProvider === 'ex3-api') {
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
  }, [currentProject, llmProvider]);

  const generateChapter = useCallback(async (chapterIndex: number) => {
    if (!currentProject || !writingSession) return;
    
    setIsLoading(true);
    setError(null);
    try {
      let result: { content: string; entities: any };
      
      if (llmProvider === 'ex3-api') {
        result = await apiService.generateChapterContent(currentProject.id, chapterIndex);
      } else {
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
      }
      
      // Update project with new chapter content
      const updatedChapters = [...currentProject.chapters];
      updatedChapters[chapterIndex] = {
        id: chapterIndex,
        title: `Chapter ${chapterIndex + 1}`,
        content: result.content,
        summary: currentProject.outline[chapterIndex],
        entities: result.entities
      };
      
      const updatedProject = {
        ...currentProject,
        chapters: updatedChapters,
        progress: ((chapterIndex + 1) / currentProject.outline.length) * 100,
        status: chapterIndex === currentProject.outline.length - 1 ? 'completed' : 'writing'
      } as NovelProject;
      
      setCurrentProject(updatedProject);
      
      if (llmProvider === 'ex3-api') {
        await apiService.updateProject(currentProject.id, {
          chapters: updatedChapters,
          progress: updatedProject.progress,
          status: updatedProject.status
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chapter';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, writingSession, llmProvider]);

  const exportNovel = useCallback(async (format: 'txt' | 'docx' | 'pdf' = 'txt') => {
    if (!currentProject) return;
    
    try {
      if (llmProvider === 'ex3-api') {
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
  }, [currentProject, llmProvider]);

  return {
    currentProject,
    writingSession,
    isLoading,
    error,
    llmProvider,
    isConnected,
    setLLMProvider,
    checkConnection,
    createProject,
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
  const words = content.split(/\s+/);
  
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