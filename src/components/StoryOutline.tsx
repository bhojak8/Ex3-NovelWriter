import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Play, BookOpen, Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useNovelWriter } from '../hooks/useNovelWriter';

interface StoryOutlineProps {
  project: any;
  onUpdateProject: (project: any) => void;
  onStartWriting: () => void;
}

export default function StoryOutline({ project, onUpdateProject, onStartWriting }: StoryOutlineProps) {
  const { generateOutline, isLoading, error } = useNovelWriter();
  const [outline, setOutline] = useState(project.outline || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  useEffect(() => {
    onUpdateProject({ ...project, outline });
  }, [outline]);

  const handleGenerateOutline = async () => {
    try {
      const generatedOutline = await generateOutline(project.premise, project.genre);
      setOutline(generatedOutline);
    } catch (err) {
      console.error('Failed to generate outline:', err);
    }
  };

  const addChapter = () => {
    if (newChapterTitle.trim()) {
      setOutline([...outline, newChapterTitle.trim()]);
      setNewChapterTitle('');
    }
  };

  const editChapter = (index: number, newTitle: string) => {
    const updatedOutline = [...outline];
    updatedOutline[index] = newTitle;
    setOutline(updatedOutline);
    setEditingIndex(null);
  };

  const deleteChapter = (index: number) => {
    setOutline(outline.filter((_: any, i: number) => i !== index));
  };

  const moveChapter = (index: number, direction: 'up' | 'down') => {
    const newOutline = [...outline];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < outline.length) {
      [newOutline[index], newOutline[targetIndex]] = [newOutline[targetIndex], newOutline[index]];
      setOutline(newOutline);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Story Outline</h2>
              <p className="text-slate-600">Plan your novel's structure and flow</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleGenerateOutline}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate AI Outline
                </>
              )}
            </Button>
            
            {outline.length > 0 && (
              <Button
                onClick={onStartWriting}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Writing
              </Button>
            )}
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-slate-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-2">{project.title}</h3>
          <p className="text-slate-600 text-sm mb-2">
            <span className="font-medium">Genre:</span> {project.genre} | 
            <span className="font-medium ml-2">Style:</span> {project.writingStyle === '一' ? 'First Person' : 'Third Person'}
          </p>
          <p className="text-slate-700">{project.premise}</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Outline Editor */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">Chapter Outline</h3>
        
        {/* Add New Chapter */}
        <div className="flex space-x-3 mb-6">
          <Input
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            placeholder="Enter chapter title or summary..."
            onKeyPress={(e) => e.key === 'Enter' && addChapter()}
            className="flex-1"
          />
          <Button onClick={addChapter} disabled={!newChapterTitle.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter
          </Button>
        </div>

        {/* Chapter List */}
        <AnimatePresence>
          {outline.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-slate-500"
            >
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No chapters yet. Add chapters manually or generate an AI outline.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {outline.map((chapter: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                        {index + 1}
                      </span>
                      
                      {editingIndex === index ? (
                        <Input
                          defaultValue={chapter}
                          onBlur={(e) => editChapter(index, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              editChapter(index, (e.target as HTMLInputElement).value);
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <p className="flex-1 text-slate-700">{chapter}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveChapter(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveChapter(index, 'down')}
                        disabled={index === outline.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(index)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteChapter(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}