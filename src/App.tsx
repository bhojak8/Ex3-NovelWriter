import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Settings, Download, Play, Pause, RotateCcw } from 'lucide-react';
import NovelCreator from './components/NovelCreator';
import StoryOutline from './components/StoryOutline';
import WritingProgress from './components/WritingProgress';
import { Button } from './components/ui/Button';
import { useNovelWriter } from './hooks/useNovelWriter';

function App() {
  const { currentProject, setCurrentProject } = useNovelWriter();
  const [isWriting, setIsWriting] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'outline' | 'write'>('create');

  const handleCreateProject = (projectData: any) => {
    setCurrentProject(projectData);
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
                <p className="text-sm text-slate-600">AI-Powered Story Creation</p>
              </div>
            </div>
            
            {currentProject && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{currentProject.title}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {currentProject.status}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {currentProject && (
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
          {!currentProject ? (
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
              <NovelCreator onCreateProject={handleCreateProject} />
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
                />
              )}
              
              {activeTab === 'outline' && currentProject && (
                <StoryOutline 
                  project={currentProject}
                  onUpdateProject={setCurrentProject}
                  onStartWriting={handleStartWriting}
                />
              )}
              
              {activeTab === 'write' && currentProject && (
                <WritingProgress 
                  project={currentProject}
                  onUpdateProject={setCurrentProject}
                  isWriting={isWriting}
                  onToggleWriting={() => setIsWriting(!isWriting)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;