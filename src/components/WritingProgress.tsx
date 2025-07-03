import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, BookOpen, Users, MapPin, Clock, RefreshCw, Save, Settings, BarChart3, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { useNovelWriter } from '../hooks/useNovelWriter';
import NovelAnalytics from './NovelAnalytics';
import CharacterBuilder from './CharacterBuilder';
import AdvancedSettings from './AdvancedSettings';

interface WritingProgressProps {
  project: any;
  onUpdateProject: (project: any) => void;
  isWriting: boolean;
  onToggleWriting: () => void;
}

export default function WritingProgress({ 
  project, 
  onUpdateProject, 
  isWriting, 
  onToggleWriting 
}: WritingProgressProps) {
  const { generateChapter, exportNovel, isLoading, error } = useNovelWriter();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [generatedContent, setGeneratedContent] = useState('');
  const [currentlyGenerating, setCurrentlyGenerating] = useState(false);
  const [entities, setEntities] = useState({
    characters: [],
    locations: []
  });
  const [characters, setCharacters] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCharacterBuilder, setShowCharacterBuilder] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [aiSettings, setAiSettings] = useState({
    temperature: 0.9,
    maxTokens: 4096,
    chapterLength: 'medium',
    writingTone: 'balanced',
    narrativeStyle: 'descriptive',
    pacing: 'moderate'
  });
  const [activeTab, setActiveTab] = useState<'writing' | 'analytics' | 'characters'>('writing');

  // Load existing chapter content if available
  useEffect(() => {
    if (project.chapters && project.chapters[currentChapter]) {
      const chapter = project.chapters[currentChapter];
      setGeneratedContent(chapter.content || '');
      setEntities(chapter.entities || { characters: [], locations: [] });
    } else {
      setGeneratedContent('');
      setEntities({ characters: [], locations: [] });
    }
  }, [currentChapter, project.chapters]);

  const handleGenerateChapter = async () => {
    if (!project.outline[currentChapter]) return;
    
    setCurrentlyGenerating(true);
    try {
      const result = await generateChapter(currentChapter);
      
      if (result) {
        setGeneratedContent(result.content);
        setEntities(result.entities);
        
        // Update project
        const updatedProject = { ...project };
        if (!updatedProject.chapters) updatedProject.chapters = [];
        
        updatedProject.chapters[currentChapter] = {
          id: currentChapter,
          title: `Chapter ${currentChapter + 1}`,
          content: result.content,
          summary: project.outline[currentChapter],
          entities: result.entities
        };
        
        onUpdateProject(updatedProject);
      }
    } catch (err) {
      console.error('Failed to generate chapter:', err);
    } finally {
      setCurrentlyGenerating(false);
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportNovel('txt');
      if (result) {
        const blob = new Blob([result.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export novel:', err);
    }
  };

  const progress = project.outline.length > 0 ? ((currentChapter + 1) / project.outline.length) * 100 : 0;
  const hasContent = generatedContent.length > 0;
  const allGeneratedContent = project.chapters?.map(c => c.content).join('\n\n') || generatedContent;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Writing Controls */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Writing Studio</h2>
              <p className="text-slate-600">Chapter {currentChapter + 1} of {project.outline.length}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowAdvancedSettings(true)}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              AI Settings
            </Button>
            
            <Button
              onClick={handleGenerateChapter}
              disabled={currentlyGenerating || isLoading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${currentlyGenerating ? 'animate-spin' : ''}`} />
              {hasContent ? 'Regenerate Chapter' : 'Generate Chapter'}
            </Button>
            
            <Button
              onClick={onToggleWriting}
              disabled={!hasContent}
              className={isWriting ? 
                "bg-red-600 hover:bg-red-700" : 
                "bg-green-600 hover:bg-green-700"
              }
            >
              {isWriting ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Writing
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Writing
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Novel
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 mb-6">
          {[
            { id: 'writing', label: 'Writing', icon: BookOpen },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'characters', label: 'Characters', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Current Chapter Info */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-2">
            Current Chapter: {project.outline[currentChapter] || 'No outline available'}
          </h3>
          <p className="text-slate-600 text-sm">
            {currentlyGenerating ? 'AI is generating content...' : 
             hasContent ? 'Chapter content ready' : 'Click "Generate Chapter" to create content'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'writing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Writing Output */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Chapter Content</h3>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>{generatedContent.split(' ').length} words</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              {currentlyGenerating ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Generating chapter content...</p>
                    <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="prose prose-lg max-w-none font-serif leading-relaxed">
                  {generatedContent.split('\n\n').map((paragraph, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="text-slate-800 mb-6 text-justify leading-8"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <BookOpen className="h-16 w-16 mx-auto mb-6 text-slate-300" />
                  <h4 className="text-lg font-medium mb-2">Ready to Generate</h4>
                  <p>Click "Generate Chapter" to create content for this chapter</p>
                </div>
              )}
            </div>
          </div>

          {/* Chapter Navigation Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Chapter Navigation</h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {project.outline.map((chapter: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentChapter(index)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                      index === currentChapter
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Chapter {index + 1}</span>
                      {project.chapters && project.chapters[index] && (
                        <span className="text-xs text-green-600">✓ Generated</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {chapter.length > 60 ? chapter.substring(0, 60) + '...' : chapter}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Entity Tracker */}
            {(entities.characters.length > 0 || entities.locations.length > 0) && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Story Elements</h3>
                
                <div className="space-y-4">
                  {entities.characters.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-slate-700">Characters</span>
                      </div>
                      <div className="space-y-2">
                        {entities.characters.slice(0, 5).map((character, index) => (
                          <div
                            key={index}
                            className="text-sm bg-slate-50 rounded-lg px-3 py-2 text-slate-700"
                          >
                            {character}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {entities.locations.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-slate-700">Locations</span>
                      </div>
                      <div className="space-y-2">
                        {entities.locations.slice(0, 5).map((location, index) => (
                          <div
                            key={index}
                            className="text-sm bg-slate-50 rounded-lg px-3 py-2 text-slate-700"
                          >
                            {location}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <NovelAnalytics project={project} generatedContent={allGeneratedContent} />
      )}

      {activeTab === 'characters' && (
        <CharacterBuilder characters={characters} onUpdateCharacters={setCharacters} />
      )}

      {/* Advanced Settings Modal */}
      <AdvancedSettings
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        settings={aiSettings}
        onSave={setAiSettings}
      />
    </div>
  );
}