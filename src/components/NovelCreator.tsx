import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Wand2, Wifi, WifiOff, Settings, Zap, Brain, Target } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { useNovelWriter, LLMProvider } from '../hooks/useNovelWriter';

interface NovelCreatorProps {
  onCreateProject: (project: any) => void;
  existingProject?: any;
}

const GENRES = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller',
  'Horror', 'Historical Fiction', 'Contemporary Fiction', 'Adventure',
  'Young Adult', 'Literary Fiction', 'Dystopian', 'Urban Fantasy',
  'Steampunk', 'Cyberpunk', 'Space Opera', 'Epic Fantasy'
];

const WRITING_STYLES = [
  { value: '一', label: 'First Person (我)' },
  { value: '三', label: 'Third Person (他/她)' }
];

const NOVEL_THEMES = [
  'Coming of Age', 'Good vs Evil', 'Love & Sacrifice', 'Power & Corruption',
  'Redemption', 'Survival', 'Identity', 'Family', 'Friendship', 'Betrayal',
  'Justice', 'Freedom', 'Discovery', 'Transformation', 'Legacy'
];

export default function NovelCreator({ onCreateProject, existingProject }: NovelCreatorProps) {
  const { 
    isLoading, 
    error, 
    llmProvider, 
    isConnected, 
    setLLMProvider, 
    checkConnection,
    generatePremise,
    createProject 
  } = useNovelWriter();

  const [formData, setFormData] = useState({
    title: existingProject?.title || '',
    genre: existingProject?.genre || 'Fantasy',
    premise: existingProject?.premise || '',
    writingStyle: existingProject?.writingStyle || '三',
    targetLength: existingProject?.targetLength || 'medium',
    themes: existingProject?.themes || ''
  });

  const [showSettings, setShowSettings] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [customTheme, setCustomTheme] = useState('');

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        ...formData,
        themes: [...selectedThemes, customTheme].filter(Boolean).join(', ')
      };
      const project = await createProject(projectData);
      onCreateProject(project);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleGeneratePremise = async () => {
    try {
      const themes = [...selectedThemes, customTheme].filter(Boolean).join(', ');
      const result = await generatePremise(formData.genre, themes);
      setFormData(prev => ({
        ...prev,
        title: result.title,
        premise: result.premise
      }));
    } catch (err) {
      console.error('Failed to generate premise:', err);
    }
  };

  const handleProviderChange = (provider: LLMProvider) => {
    setLLMProvider(provider);
    if (provider === 'ex3-api') {
      checkConnection();
    }
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const addCustomTheme = () => {
    if (customTheme.trim() && !selectedThemes.includes(customTheme)) {
      setSelectedThemes(prev => [...prev, customTheme]);
      setCustomTheme('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="writing-animation p-2 rounded-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create Your Novel</h2>
                <p className="text-blue-100">Advanced AI-powered story creation with Ex3 framework</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 text-white">
                {llmProvider === 'ex3-api' ? (
                  isConnected ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-300" />
                      <span className="text-sm">Ex3 API Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-300" />
                      <span className="text-sm">Ex3 API Offline</span>
                    </>
                  )
                ) : (
                  <>
                    <Brain className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm">Local LLM Mode</span>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-slate-200 p-6 bg-gradient-to-r from-slate-50 to-blue-50"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 text-blue-600 mr-2" />
              AI Provider & Model Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  AI Provider
                </label>
                <Select
                  value={llmProvider}
                  onValueChange={(value) => handleProviderChange(value as LLMProvider)}
                >
                  <option value="ex3-api">Ex3 API (Recommended)</option>
                  <option value="local-llm">Local LLM (Ollama)</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Connection Status
                </label>
                <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border">
                  {llmProvider === 'ex3-api' ? (
                    isConnected ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700">Connected</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-700">Disconnected</span>
                      </>
                    )
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-700">Local Mode</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={checkConnection}
                  variant="outline"
                  size="sm"
                  disabled={llmProvider !== 'ex3-api'}
                  className="w-full"
                >
                  Test Connection
                </Button>
              </div>
            </div>
            
            {llmProvider === 'local-llm' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Local LLM Mode:</strong> Ensure Ollama is running on localhost:11434 
                  with a compatible model (llama2, mistral, codellama) installed.
                </p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Novel Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your novel title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Genre
                </label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}
                >
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Story Premise */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                Story Premise
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePremise}
                disabled={isLoading}
                className="text-xs"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                {isLoading ? 'Generating...' : 'AI Generate Premise'}
              </Button>
            </div>
            
            <Textarea
              value={formData.premise}
              onChange={(e) => setFormData(prev => ({ ...prev, premise: e.target.value }))}
              placeholder="Describe your story concept, main characters, central conflict, and what makes it unique..."
              rows={5}
              required
            />
          </div>

          {/* Themes Selection */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 text-purple-600 mr-2" />
              Themes & Elements
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Select Themes (Choose multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {NOVEL_THEMES.map(theme => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => toggleTheme(theme)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedThemes.includes(theme)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  placeholder="Add custom theme..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTheme())}
                />
                <Button type="button" onClick={addCustomTheme} variant="outline">
                  Add
                </Button>
              </div>
              
              {selectedThemes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-slate-600">Selected:</span>
                  {selectedThemes.map(theme => (
                    <span
                      key={theme}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                    >
                      {theme}
                      <button
                        type="button"
                        onClick={() => toggleTheme(theme)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Writing Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 text-orange-600 mr-2" />
              Writing Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Writing Style
                </label>
                <Select
                  value={formData.writingStyle}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, writingStyle: value }))}
                >
                  {WRITING_STYLES.map(style => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Length
                </label>
                <Select
                  value={formData.targetLength}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, targetLength: value }))}
                >
                  <option value="short">Short Novel (20-30k words)</option>
                  <option value="medium">Medium Novel (50-80k words)</option>
                  <option value="long">Long Novel (80-120k words)</option>
                  <option value="epic">Epic Novel (120k+ words)</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 px-8"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Project...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Novel Project
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}