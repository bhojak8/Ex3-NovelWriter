import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Wand2, Wifi, WifiOff, Settings } from 'lucide-react';
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
  'Young Adult', 'Literary Fiction', 'Dystopian'
];

const WRITING_STYLES = [
  { value: '一', label: 'First Person (我)' },
  { value: '三', label: 'Third Person (他/她)' }
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

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const project = await createProject(formData);
      onCreateProject(project);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleGeneratePremise = async () => {
    try {
      const result = await generatePremise(formData.genre, formData.themes);
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

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Create Your Novel</h2>
                <p className="text-blue-100">Set up your story parameters and let AI help you craft an amazing novel</p>
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
                    <Sparkles className="h-4 w-4 text-yellow-300" />
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

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-slate-200 p-6 bg-slate-50"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">LLM Provider Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="flex items-end">
                <Button
                  onClick={checkConnection}
                  variant="outline"
                  size="sm"
                  disabled={llmProvider !== 'ex3-api'}
                >
                  Test Connection
                </Button>
              </div>
            </div>
            
            {llmProvider === 'local-llm' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Local LLM Mode:</strong> Make sure you have Ollama running on localhost:11434 
                  with a compatible model (e.g., llama2, mistral) installed.
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

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Story Premise
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePremise}
                disabled={isLoading}
                className="text-xs"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                {isLoading ? 'Generating...' : 'Generate AI Premise'}
              </Button>
            </div>
            <Textarea
              value={formData.premise}
              onChange={(e) => setFormData(prev => ({ ...prev, premise: e.target.value }))}
              placeholder="Describe your story concept, main characters, and central conflict..."
              rows={4}
              required
            />
          </div>

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
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Themes & Elements (Optional)
            </label>
            <Input
              value={formData.themes}
              onChange={(e) => setFormData(prev => ({ ...prev, themes: e.target.value }))}
              placeholder="e.g., redemption, friendship, coming of age, political intrigue..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Project...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
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