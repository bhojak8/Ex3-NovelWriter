import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Wand2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import NovelWriterService from '../services/novelWriterService';

interface NovelCreatorProps {
  onCreateProject: (project: any) => void;
  existingProject?: any;
  novelWriterService?: NovelWriterService | null;
}

const GENRES = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Thriller',
  'Horror', 'Historical Fiction', 'Contemporary Fiction', 'Adventure',
  'Young Adult', 'Literary Fiction', 'Dystopian', '玄幻', '武侠', '都市', '言情'
];

const WRITING_STYLES = [
  { value: '一', label: 'First Person (我)' },
  { value: '三', label: 'Third Person (他/她)' }
];

export default function NovelCreator({ onCreateProject, existingProject, novelWriterService }: NovelCreatorProps) {
  const [formData, setFormData] = useState({
    title: existingProject?.title || '',
    genre: existingProject?.genre || 'Fantasy',
    premise: existingProject?.premise || '',
    writingStyle: existingProject?.writingStyle || '三',
    targetLength: existingProject?.targetLength || 'medium',
    themes: existingProject?.themes || ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onCreateProject(formData);
    setIsGenerating(false);
  };

  const generatePremise = async () => {
    if (!novelWriterService) {
      alert('Please configure your API keys first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await novelWriterService.generatePremise(formData.genre, formData.themes);
      
      // Parse the response to extract title and premise
      const lines = response.split('\n');
      const titleLine = lines.find(line => line.includes('小说标题：'));
      const summaryLine = lines.find(line => line.includes('简介：'));
      
      if (titleLine) {
        const title = titleLine.replace('小说标题：', '').replace(/《|》/g, '').trim();
        setFormData(prev => ({ ...prev, title }));
      }
      
      if (summaryLine) {
        const premise = summaryLine.replace('简介：', '').trim();
        setFormData(prev => ({ ...prev, premise }));
      }
    } catch (error) {
      console.error('Error generating premise:', error);
      alert('Failed to generate premise. Please check your API configuration.');
    }
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Create Your Novel</h2>
              <p className="text-blue-100">Set up your story parameters and let AI help you craft an amazing novel</p>
            </div>
          </div>
        </div>

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
                onClick={generatePremise}
                disabled={isGenerating || !novelWriterService}
                className="text-xs"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                {isGenerating ? 'Generating...' : 'Generate AI Premise'}
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
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
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