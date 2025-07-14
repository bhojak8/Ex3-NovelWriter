import { useState, useCallback } from 'react';
import { apiService, NovelProject, WritingSession } from '../services/api';
import { localLLMService } from '../services/localLLM';

export interface UseNovelWriterState {
  currentProject: NovelProject | null;
  projects: NovelProject[];
  writingSession: WritingSession | null;
  llmProvider: 'ex3-api' | 'local-llm';
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  isLocalLLMConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'checking';
}

export interface UseNovelWriterActions {
  setCurrentProject: (project: NovelProject | null) => void;
  setProjects: (projects: NovelProject[]) => void;
  setWritingSession: (session: WritingSession | null) => void;
  setLLMProvider: (provider: 'ex3-api' | 'local-llm') => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsLocalLLMConnected: (connected: boolean) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'checking') => void;
  loadProjects: () => Promise<NovelProject[]>;
  createProject: (projectData: Partial<NovelProject>) => Promise<NovelProject>;
  updateProject: (projectId: string, projectData: Partial<NovelProject>) => Promise<NovelProject>;
  deleteProject: (projectId: string) => Promise<void>;
  generatePremise: (genre: string, themes?: string, modelName?: string) => Promise<{ title: string; premise: string }>;
  generateOutline: (premise: string, genre: string, modelName?: string) => Promise<string[]>;
  startWritingSession: (projectId: string) => Promise<WritingSession>;
  generateChapterContent: (projectId: string, chapterIndex: number, modelName?: string) => Promise<{ content: string; entities: any }>;
  exportNovel: (projectId: string, format?: 'txt' | 'docx' | 'pdf') => Promise<{ content: string; filename: string }>;
  checkConnection: () => Promise<any>;
  checkLocalLLMConnection: () => Promise<any>;
}

export function useNovelWriter(): UseNovelWriterState & UseNovelWriterActions {
  const [currentProject, setCurrentProject] = useState<NovelProject | null>(null);
  const [projects, setProjects] = useState<NovelProject[]>([]);
  const [writingSession, setWritingSession] = useState<WritingSession | null>(null);
  const [llmProvider, setLLMProvider] = useState<'ex3-api' | 'local-llm'>('ex3-api');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLocalLLMConnected, setIsLocalLLMConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('disconnected');

  const getService = useCallback(() => {
    return llmProvider === 'local-llm' ? localLLMService : apiService;
  }, [llmProvider]);

  const loadProjects = useCallback(async (): Promise<NovelProject[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const service = getService();
      const loadedProjects = await service.getAllProjects();
      setProjects(loadedProjects);
      if (llmProvider === 'ex3-api') {
        setIsConnected(true);
      } else {
        setIsLocalLLMConnected(true);
      }
      return loadedProjects;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      if (llmProvider === 'ex3-api') {
        setIsConnected(false);
      } else {
        setIsLocalLLMConnected(false);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService, llmProvider]);

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

  const checkConnection = useCallback(async () => {
    try {
      setConnectionStatus('checking');
      setError(null);
      const result = await apiService.checkHealth();
      setIsConnected(true);
      setConnectionStatus('connected');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API connection failed';
      setError(errorMessage);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      throw err;
    }
  }, []);

  const checkLocalLLMConnection = useCallback(async () => {
    try {
      setError(null);
      const result = await localLLMService.checkHealth();
      setIsLocalLLMConnected(true);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Local LLM connection failed';
      setError(errorMessage);
      setIsLocalLLMConnected(false);
      throw err;
    }
  }, []);

  return {
    // State
    currentProject,
    projects,
    writingSession,
    llmProvider,
    isLoading,
    error,
    isConnected,
    isLocalLLMConnected,
    connectionStatus,
    // Actions
    setCurrentProject,
    setProjects,
    setWritingSession,
    setLLMProvider,
    setIsLoading,
    setError,
    setIsConnected,
    setIsLocalLLMConnected,
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
    checkConnection,
    checkLocalLLMConnection,
  };
}