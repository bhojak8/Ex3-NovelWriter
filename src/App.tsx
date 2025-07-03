import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Settings, Zap, Brain, Users, Sparkles } from 'lucide-react';
import ProjectDashboard from './components/ProjectDashboard';
import NovelCreator from './components/NovelCreator';
import StoryOutline from './components/StoryOutline';
import WritingProgress from './components/WritingProgress';
import ConnectionStatus from './components/ConnectionStatus';
import ModelManager from './components/ModelManager';
import { Button } from './components/ui/Button';
import { useNovelWriter } from './hooks/useNovelWriter';

type AppView = 'dashboard' | 'creator' | 'outline' | 'writing' | 'models';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const { currentProject, llmProvider, setLLMProvider } = useNovelWriter();

  // Auto-navigate based on project state
  useEffect(() => {
    if (currentProject) {
      if (currentProject.outline.length === 0) {
        setCurrentView('outline');
      } else if (currentProject.status === 'writing' || currentProject.chapters.length > 0) {
        setCurrentView('writing');
      }
    }
  }, [currentProject]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'creator':
        return (
          <NovelCreator 
            onComplete={() => setCurrentView('outline')}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'outline':
        return (
          <StoryOutline 
            onComplete={() => setCurrentView('writing')}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'writing':
        return (
          <WritingProgress 
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'models':
        return (
          <ModelManager 
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return (
          <ProjectDashboard 
            onCreateNew={() => setCurrentView('creator')}
            onSelectProject={() => setCurrentView('outline')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Connection Status */}
      <ConnectionStatus />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setCurrentView('dashboard')}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Ex3 Novel Writer</h1>
                  <p className="text-xs text-slate-500">AI-Powered Storytelling</p>
                </div>
              </motion.div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant={currentView === 'models' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('models')}
              >
                <Brain className="h-4 w-4 mr-1" />
                Models
              </Button>
            </nav>

            <div className="flex items-center space-x-3">
              {/* LLM Provider Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setLLMProvider('ex3-api')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    llmProvider === 'ex3-api'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="h-3 w-3 mr-1 inline" />
                  Ex3 API
                </button>
                <button
                  onClick={() => setLLMProvider('local-llm')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    llmProvider === 'local-llm'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Brain className="h-3 w-3 mr-1 inline" />
                  Local
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    LLM Provider
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      variant={llmProvider === 'ex3-api' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLLMProvider('ex3-api')}
                      className="flex-1"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Ex3 API
                    </Button>
                    <Button
                      variant={llmProvider === 'local-llm' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLLMProvider('local-llm')}
                      className="flex-1"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Local LLM
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => setShowSettings(false)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-4">
              <span>© 2024 Ex3 Novel Writer</span>
              <span>•</span>
              <span>AI-Powered Creative Writing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Advanced AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;