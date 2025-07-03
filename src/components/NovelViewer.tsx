import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, Share2, Eye, Type, Palette } from 'lucide-react';
import { Button } from './ui/Button';

interface NovelViewerProps {
  project: any;
  generatedContent: string;
}

export default function NovelViewer({ project, generatedContent }: NovelViewerProps) {
  const [viewMode, setViewMode] = useState<'reader' | 'manuscript'>('reader');
  const [fontSize, setFontSize] = useState('medium');
  const [theme, setTheme] = useState('light');

  const formatNovelContent = (content: string) => {
    if (!content) return [];
    
    // Split content into paragraphs and format them properly
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Detect dialogue
      const isDialogue = paragraph.includes('"') || paragraph.includes('"') || paragraph.includes('"');
      
      // Detect scene breaks
      const isSceneBreak = paragraph.includes('***') || paragraph.includes('---');
      
      return {
        id: index,
        content: paragraph.trim(),
        type: isSceneBreak ? 'scene-break' : isDialogue ? 'dialogue' : 'narrative',
        isDialogue,
        isSceneBreak
      };
    });
  };

  const formattedContent = formatNovelContent(generatedContent);

  const fontSizeClasses = {
    small: 'text-base leading-7',
    medium: 'text-lg leading-8',
    large: 'text-xl leading-9'
  };

  const themeClasses = {
    light: 'bg-white text-slate-900',
    sepia: 'bg-amber-50 text-amber-900',
    dark: 'bg-slate-900 text-slate-100'
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Viewer Controls */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{project.title}</h2>
                <p className="text-sm text-slate-600">Novel Preview</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* View Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('reader')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'reader'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Reader View
                </button>
                <button
                  onClick={() => setViewMode('manuscript')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'manuscript'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Type className="h-4 w-4 inline mr-1" />
                  Manuscript
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Font Size */}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="text-sm border border-slate-300 rounded-md px-2 py-1"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>

              {/* Theme */}
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="text-sm border border-slate-300 rounded-md px-2 py-1"
              >
                <option value="light">Light</option>
                <option value="sepia">Sepia</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Novel Content */}
        <div className={`${themeClasses[theme as keyof typeof themeClasses]} transition-colors duration-300`}>
          {viewMode === 'reader' ? (
            // Reader View - Book-like formatting
            <div className="p-12 max-w-3xl mx-auto">
              <div className="mb-12 text-center border-b border-current pb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">{project.title}</h1>
                <p className="text-lg opacity-75">Chapter 1</p>
              </div>

              <div className={`font-serif ${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]} space-y-6`}>
                {formattedContent.map((paragraph, index) => (
                  <motion.div
                    key={paragraph.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {paragraph.isSceneBreak ? (
                      <div className="text-center py-8">
                        <div className="text-2xl opacity-50">* * *</div>
                      </div>
                    ) : (
                      <p className={`text-justify ${
                        paragraph.isDialogue ? 'ml-4' : ''
                      }`}>
                        {paragraph.content}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            // Manuscript View - Standard formatting
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 pb-4 border-b border-current">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-mono font-bold">{project.title}</h1>
                      <p className="text-sm opacity-75 mt-1">by Author Name</p>
                    </div>
                    <div className="text-right text-sm opacity-75">
                      <p>Word Count: ~{generatedContent.split(' ').length}</p>
                      <p>Page 1</p>
                    </div>
                  </div>
                </div>

                <div className={`font-mono ${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]} space-y-4`}>
                  {formattedContent.map((paragraph, index) => (
                    <motion.div
                      key={paragraph.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      {paragraph.isSceneBreak ? (
                        <div className="text-center py-6">
                          <div className="text-xl opacity-50">***</div>
                        </div>
                      ) : (
                        <p className="leading-loose">
                          <span className="opacity-50 text-xs mr-4">{index + 1}</span>
                          {paragraph.content}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}