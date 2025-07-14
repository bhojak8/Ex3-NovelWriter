import { useState, useCallback } from 'react';
import { apiService, NovelProject, WritingSession } from '../services/api';
import { localLLMService } from '../services/localLLM';

export interface UseNovelWriterState {
  currentProject: NovelProject | null;
  projects: NovelProject[];
  writingSession: WritingSession | null;
  llmProvider: 'api' | 'local';
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'checking';
}

export interface UseNovelWriterActions {
  setCurrentProject: (project: NovelProject | null) => void;
  setProjects: (projects: NovelProject[]) => void;
  setWritingSession: (session: WritingSession | null) => void;
  setLLMProvider: (provider: 'api' | 'local') => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'checking') => void;
  loadProjects: () => Promise<void>;
  createProject: (projectData: Partial<NovelProject>) => Promise<NovelProject>;
  updateProject: (projectId: string, projectData: Partial<NovelProject>) => Promise<NovelProject>;
  deleteProject: (projectId: string) => Promise<void>;
  generatePremise: (genre: string, themes?: string, modelName?: string) => Promise<{ title: string; premise: string }>;
  generateOutline: (premise: string, genre: string, modelName?: string) => Promise<string[]>;
  startWritingSession: (projectId: string) => Promise<WritingSession>;
  generateChapterContent: (projectId: string, chapterIndex: number, modelName?: string) => Promise<{ content: string; entities: any }>;
  exportNovel: (projectId: string, format?: 'txt' | 'docx' | 'pdf') => Promise<{ content: string; filename: string }>;
  checkHealth: () => Promise<any>;
}

export function useNovelWriter(): UseNovelWriterState & UseNovelWriterActions {
  const [currentProject, setCurrentProject] = useState<NovelProject | null>(null);
  const [projects, setProjects] = useState<NovelProject[]>([]);
  const [writingSession, setWritingSession] = useState<WritingSession | null>(null);
  const [llmProvider, setLLMProvider] = useState<'api' | 'local'>('api');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('disconnected');

  const getService = useCallback(() => {
    return llmProvider === 'local' ? localLLMService : apiService;
  }, [llmProvider]);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      const loadedProjects = await service.getAllProjects();
      setProjects(loadedProjects);
      setConnectionStatus('connected');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      setConnectionStatus('disconnected');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  const createProject = useCallback(async (projectData: Partial<NovelProject>) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      const newProject = await service.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  const updateProject = useCallback(async (projectId: string, projectData: Partial<NovelProject>) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      const updatedProject = await service.updateProject(projectId, projectData);
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService, currentProject]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      await service.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService, currentProject]);

  const generatePremise = useCallback(async (genre: string, themes?: string, modelName?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      return await service.generatePremise(genre, themes, modelName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate premise';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  const generateOutline = useCallback(async (premise: string, genre: string, modelName?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      return await service.generateOutline(premise, genre, modelName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate outline';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  const startWritingSession = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      const session = await service.startWritingSession(projectId);
      setWritingSession(session);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start writing session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  const generateChapterContent = useCallback(async (projectId: string, chapterIndex: number, modelName?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      return await service.generateChapterContent(projectId, chapterIndex, modelName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate chapter content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  const exportNovel = useCallback(async (projectId: string, format: 'txt' | 'docx' | 'pdf' = 'txt') => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      return await service.exportNovel(projectId, format);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export novel';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  const checkHealth = useCallback(async () => {
    try {
      setConnectionStatus('checking');
      setError(null);
      const service = getService();
      const result = await service.checkHealth();
      setConnectionStatus('connected');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
      setConnectionStatus('disconnected');
      throw err;
    }
  }, [getService]);

  return {
    // State
    currentProject,
    projects,
    writingSession,
    llmProvider,
    isLoading,
    error,
    connectionStatus,
    // Actions
    setCurrentProject,
    setProjects,
    setWritingSession,
    setLLMProvider,
    setIsLoading,
    setError,
    setConnectionStatus,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    generatePremise,
    generateOutline,
    startWritingSession,
    generateChapterContent,
    exportNovel,
    checkHealth,
  };
}