import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Sparkles, Settings, Download, Play, Pause, RotateCcw, 
  Home, Grid, Users, BarChart3, Globe, Lightbulb, Brain, Target
} from 'lucide-react';
import NovelCreator from './components/NovelCreator';
import StoryOutline from './components/StoryOutline';
import WritingProgress from './components/WritingProgress';
import ProjectDashboard from './components/ProjectDashboard';
import EnhancedWritingStudio from './components/EnhancedWritingStudio';
import AIAssistant from './components/AIAssistant';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import CollaborationHub from './components/CollaborationHub';
import SmartTemplates from './components/SmartTemplates';
import PublishingHub from './components/PublishingHub';
import { Button } from './components/ui/Button';
import { useNovelWriter } from './hooks/useNovelWriter';

type AppView = 'dashboard' | 'create' | 'outline' | 'write' | 'studio' | 'analytics' | 'collaborate' | 'templates' | 'publish';

function App() {
  const { currentProject, setCurrentProject, isLoading } = useNovelWriter();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isWriting, setIsWriting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const handleSelectTemplate = (template: any) => {
    // Create project from template
    const projectData = {
      title: template.name,
      genre: template.genre,
      premise: template.description,
      outline: template.outline,
      writingStyle: '三',
      targetLength: template.estimatedLength,
      themes: template.themes.join(', ')
    };
    handleCreateProject(projectData);
  };

  const handleCreateCustomTemplate = (template: any) => {
    console.log('Creating custom template:', template);
    // In a real app, this would save the template
  };

  const handlePublish = (settings: any) => {
    console.log('Publishing with settings:', settings);
    // In a real app, this would handle the publishing process
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Project Dashboard';
      case 'create': return 'Create New Project';
      case 'outline': return 'Story Outline';
      case 'write': return 'Writing Progress';
      case 'studio': return 'Writing Studio';
      case 'analytics': return 'Advanced Analytics';
      case 'collaborate': return 'Collaboration Hub';
      case 'templates': return 'Smart Templates';
      case 'publish': return 'Publishing Hub';
      default: return 'Ex3 Novel Writer';
    }
  };

  const navigationItems = [
    { id: 'outline', label: 'Outline', icon: BookOpen, color: 'text-blue-600' },
    { id: 'studio', label: 'Studio', icon: Sparkles, color: 'text-purple-600' },
    { id: 'write', label: 'Progress', icon: Play, color: 'text-green-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-600' },
    { id: 'collaborate', label: 'Collaborate', icon: Users, color: 'text-pink-600' },
    { id: 'publish', label: 'Publish', icon: Globe, color: 'text-indigo-600' }
  ];

  const utilityItems = [
    { id: 'templates', label: 'Templates', icon: Lightbulb, color: 'text-yellow-600' },
    { id: 'create', label: 'New Project', icon: Target, color: 'text-cyan-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Enhanced Sidebar */}
      {currentProject && (
        <motion.div
          initial={{ width: sidebarCollapsed ? 80 : 280 }}
          animate={{ width: sidebarCollapsed ? 80 : 280 }}
          className="bg-white border-r border-slate-200 shadow-lg flex flex-col"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="writing-animation p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 truncate">{currentProject.title}</h2>
                    <p className="text-xs text-slate-500">{currentProject.genre}</p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-2">
                  Project Tools
                </p>
              )}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as AppView)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${currentView === item.id ? 'text-blue-600' : item.color}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200">
              {!sidebarCollapsed && (
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-2">
                  Utilities
                </p>
              )}
              {utilityItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as AppView)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${currentView === item.id ? 'text-blue-600' : item.color}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              {!sidebarCollapsed && 'Dashboard'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!currentProject && (
                  <div className="flex items-center space-x-3">
                    <div className="writing-animation p-2 rounded-lg">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900">Ex3 Novel Writer</h1>
                      <p className="text-sm text-slate-600">AI-Powered Story Creation</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{getViewTitle()}</h2>
                  {currentProject && (
                    <p className="text-sm text-slate-600">
                      {Math.round(currentProject.progress || 0)}% complete • {currentProject.chapters?.length || 0} chapters
                    </p>
                  )}
                </div>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-3">
                {currentProject && (
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentProject.status === 'completed' ? 'bg-green-100 text-green-800' :
                      currentProject.status === 'writing' ? 'bg-blue-100 text-blue-800' :
                      currentProject.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentProject.status}
                    </span>
                  </div>
                )}
                
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
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

            {currentView === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SmartTemplates
                  onSelectTemplate={handleSelectTemplate}
                  onCreateCustom={handleCreateCustomTemplate}
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

            {currentView === 'analytics' && currentProject && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AdvancedAnalytics
                  project={currentProject}
                  generatedContent={currentProject.chapters?.map((c: any) => c.content).join('\n\n') || ''}
                />
              </motion.div>
            )}

            {currentView === 'collaborate' && currentProject && (
              <motion.div
                key="collaborate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CollaborationHub
                  project={currentProject}
                  onUpdateProject={setCurrentProject}
                />
              </motion.div>
            )}

            {currentView === 'publish' && currentProject && (
              <motion.div
                key="publish"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PublishingHub
                  project={currentProject}
                  onPublish={handlePublish}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* AI Assistant - Available on writing views */}
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