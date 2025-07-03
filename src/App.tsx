import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Settings, Download, Play, Pause, RotateCcw } from 'lucide-react';
import NovelCreator from './components/NovelCreator';
import StoryOutline from './components/StoryOutline';
import WritingProgress from './components/WritingProgress';
import APISettings from './components/APISettings';
import { Button } from './components/ui/Button';
import APIService from './services/apiService';
import NovelWriterService from './services/novelWriterService';

interface NovelProject {
  id: string;
  title: string;
  genre: string;
  premise: string;
  outline: string[];
  chapters: Array<{
    title: string;
    content: string;
    summary: string;
  }>;
  status: 'planning' | 'writing' | 'completed';
  progress: number;
  writingStyle: '一' | '三';
  targetLength: string;
  themes?: string;
}

function App() {
  const [currentProject, setCurrentProject] = useState<NovelProject | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'outline' | 'write'>('create');
  const [showAPISettings, setShowAPISettings] = useState(false);
  const [apiService, setApiService] = useState<APIService | null>(null);
  const [novelWriterService, setNovelWriterService] = useState<NovelWriterService | null>(null);
  const [isAPIConfigured, setIsAPIConfigured] = useState(false);

  useEffect(() => {
    // Check if API keys are already configured
    const geminiKey = localStorage.getItem('gemini_api_key');
    const perplexityKey = localStorage.getItem('perplexity_api_key');
    
    if (geminiKey && perplexityKey) {
      const apiSvc = new APIService({
        geminiApiKey: geminiKey,
        perplexityApiKey: perplexityKey
      });
      setApiService(apiSvc);
      setNovelWriterService(new NovelWriterService(apiSvc));
      setIsAPIConfigured(true);
    } else {
      setShowAPISettings(true);
    }
  }, []);

  const handleAPIConfigSave = (config: { geminiApiKey: string; perplexityApiKey: string }) => {
    const apiSvc = new APIService(config);
    setApiService(apiSvc);
    setNovelWriterService(new NovelWriterService(apiSvc));
    setIsAPIConfigured(true);
  };

  const handleCreateProject = (projectData: Partial<NovelProject>) => {
    const newProject: NovelProject = {
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
      ...projectData
    };
    setCurrentProject(newProject);
    setActiveTab('outline');
  };

  const handleStartWriting = () => {
    if (currentProject) {
      setIsWriting(true);
      setActiveTab('write');
      setCurrentProject({
        ...currentProject,
        status: 'writing'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="writing-animation p-2 rounded-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Ex3 Novel Writer</h1>
                <p className="text-sm text-slate-600">AI-Powered Story Creation with Gemini & Perplexity</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentProject && (
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{currentProject.title}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {currentProject.status}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                {isAPIConfigured && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAPISettings(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isAPIConfigured ? 'API Settings' : 'Configure APIs'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {currentProject && isAPIConfigured && (
        <nav className="border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'create', label: 'Project Setup', icon: Sparkles },
                { id: 'outline', label: 'Story Outline', icon: BookOpen },
                { id: 'write', label: 'Writing', icon: Play }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!isAPIConfigured ? (
            <motion.div
              key="api-setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="writing-animation inline-block p-4 rounded-2xl mb-6">
                <Settings className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Configure Your AI Services
              </h2>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                To start creating novels, you'll need API keys for Gemini Pro and Perplexity.
                These services power the AI writing capabilities.
              </p>
              <Button
                onClick={() => setShowAPISettings(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Settings className="h-5 w-5 mr-2" />
                Configure API Keys
              </Button>
            </motion.div>
          ) : !currentProject ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="writing-animation inline-block p-4 rounded-2xl mb-6">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Welcome to Ex3 Novel Writer
              </h2>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Create compelling novels with AI assistance. From initial concept to finished manuscript,
                our three-stage process helps you craft engaging stories.
              </p>
              <NovelCreator 
                onCreateProject={handleCreateProject} 
                novelWriterService={novelWriterService}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'create' && (
                <NovelCreator 
                  onCreateProject={handleCreateProject}
                  existingProject={currentProject}
                  novelWriterService={novelWriterService}
                />
              )}
              
              {activeTab === 'outline' && currentProject && (
                <StoryOutline 
                  project={currentProject}
                  onUpdateProject={setCurrentProject}
                  onStartWriting={handleStartWriting}
                  novelWriterService={novelWriterService}
                />
              )}
              
              {activeTab === 'write' && currentProject && (
                <WritingProgress 
                  project={currentProject}
                  onUpdateProject={setCurrentProject}
                  isWriting={isWriting}
                  onToggleWriting={() => setIsWriting(!isWriting)}
                  novelWriterService={novelWriterService}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* API Settings Modal */}
      <APISettings
        isOpen={showAPISettings}
        onClose={() => setShowAPISettings(false)}
        onSave={handleAPIConfigSave}
      />
    </div>
  );
}

export default App;