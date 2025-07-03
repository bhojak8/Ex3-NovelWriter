import { useState, useCallback } from 'react';
import { apiService, NovelProject, WritingSession } from '../services/api';

export function useNovelWriter() {
  const [currentProject, setCurrentProject] = useState<NovelProject | null>(null);
  const [writingSession, setWritingSession] = useState<WritingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = useCallback(async (projectData: Partial<NovelProject>) => {
    setIsLoading(true);
    setError(null);
    try {
      const project = await apiService.createProject(projectData);
      setCurrentProject(project);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateOutline = useCallback(async (premise: string, genre: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const outline = await apiService.generateOutline(premise, genre);
      if (currentProject) {
        const updatedProject = await apiService.updateProject(currentProject.id, { outline });
        setCurrentProject(updatedProject);
      }
      return outline;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate outline');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const startWriting = useCallback(async () => {
    if (!currentProject) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const session = await apiService.startWritingSession(currentProject.id);
      setWritingSession(session);
      return session;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start writing session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const generateChapter = useCallback(async (chapterIndex: number) => {
    if (!currentProject || !writingSession) return;
    
    setIsLoading(true);
    try {
      const result = await apiService.generateChapterContent(
        currentProject.id, 
        chapterIndex
      );
      
      // Update project with new chapter content
      const updatedChapters = [...currentProject.chapters];
      updatedChapters[chapterIndex] = {
        ...updatedChapters[chapterIndex],
        content: result.content,
        entities: result.entities
      };
      
      const updatedProject = {
        ...currentProject,
        chapters: updatedChapters,
        progress: ((chapterIndex + 1) / currentProject.outline.length) * 100
      };
      
      setCurrentProject(updatedProject);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate chapter');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, writingSession]);

  return {
    currentProject,
    writingSession,
    isLoading,
    error,
    createProject,
    generateOutline,
    startWriting,
    generateChapter,
    setCurrentProject
  };
}