import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Settings, Download, Play, Pause, RotateCcw, Home, Grid } from 'lucide-react';
import NovelCreator from './components/NovelCreator';
import StoryOutline from './components/StoryOutline';
import WritingProgress from './components/WritingProgress';
import ProjectDashboard from './components/ProjectDashboard';
import EnhancedWritingStudio from './components/EnhancedWritingStudio';
import AIAssistant from './components/AIAssistant';
import { Button } from './components/ui/Button';
import { useNovelWriter } from './hooks/useNovelWriter';

type AppView = 'dashboard' | 'create' | 'outline' | 'write' | 'studio';

function App() {
  const { currentProject, setCurrentProject, isLoading } = useNovelWriter();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isWriting, setIsWriting] = useState(false);

  // Load dashboard on startup
  useEffect(() => {
    if (!currentProject) {
      setCurrentView('dashboard');
    }
  }, [currentProject]);

  const handleCreateProject = (projectData: any) => {
    setCurrentProject(projectData);
    setCurrentView('outline');
  };

  const handleSelectProject = (project: any) => {
    setCurrentProject(project);
    setCurrentView('studio');
  };

  const handleStartWriting = () => {
    setIsWriting(true);
    setCurrentView('write');
  };

  const handleBackToDashboard = () => {
    setCurrentProject(null);
    setCurrentView('dashboard');
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Project Dashboard';
      case 'create': return 'Create New Project';
      case 'outline': return 'Story Outline';
      case 'write': return 'Writing Progress';
      case 'studio': return 'Writing Studio';
      default: return 'Ex3 Novel Writer';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBackToDashboard}
                className="writing-animation p-2 rounded-lg hover:scale-105 transition-transform"
              >
                <BookOpen className="h-8 w-8 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Ex3 Novel Writer</h1>
                <p className="text-sm text-slate-600">{getViewTitle()}</p>
              </div>
            </div>
            
            {/* Navigation */}
            {currentProject && (
              <nav className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                {[
                  { id: 'outline', label: 'Outline', icon: BookOpen },
                  { id: 'studio', label: 'Studio', icon: Sparkles },
                  { id: 'write', label: 'Progress', icon: Play }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentView(tab.id as AppView)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentView === tab.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}
            
            {/* Project Info & Actions */}
            {currentProject && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{currentProject.title}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {currentProject.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBackToDashboard}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectDashboard
                onCreateNew={() => setCurrentView('create')}
                onSelectProject={handleSelectProject}
              />
            </motion.div>
          )}

          {currentView === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NovelCreator 
                onCreateProject={handleCreateProject}
                existingProject={currentProject}
              />
            </motion.div>
          )}
          
          {currentView === 'outline' && currentProject && (
            <motion.div
              key="outline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StoryOutline 
                project={currentProject}
                onUpdateProject={setCurrentProject}
                onStartWriting={handleStartWriting}
              />
            </motion.div>
          )}
          
          {currentView === 'write' && currentProject && (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WritingProgress 
                project={currentProject}
                onUpdateProject={setCurrentProject}
                isWriting={isWriting}
                onToggleWriting={() => setIsWriting(!isWriting)}
              />
            </motion.div>
          )}

          {currentView === 'studio' && currentProject && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedWritingStudio
                project={currentProject}
                onUpdateProject={setCurrentProject}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Assistant - Available on all views with projects */}
      {currentProject && (currentView === 'studio' || currentView === 'write') && (
        <AIAssistant
          project={currentProject}
          currentChapter={0}
          onApplySuggestion={(suggestion) => {
            console.log('Apply suggestion:', suggestion);
          }}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-slate-900 font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;