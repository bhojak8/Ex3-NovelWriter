import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Save, Undo, Redo, Eye, Edit3, Download, 
  Settings, Zap, Brain, BookOpen, Users, MapPin, Clock,
  RefreshCw, Copy, Share2, Maximize2, Minimize2, Volume2,
  VolumeX, Moon, Sun, Type, AlignLeft, Bold, Italic
} from 'lucide-react';
import { Button } from './ui/Button';
import { useNovelWriter } from '../hooks/useNovelWriter';

interface EnhancedWritingStudioProps {
  project: any;
  onUpdateProject: (project: any) => void;
}

export default function EnhancedWritingStudio({ project, onUpdateProject }: EnhancedWritingStudioProps) {
  const { generateChapter, isLoading, error } = useNovelWriter();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [showStats, setShowStats] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Writing history for undo/redo
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Auto-save functionality
  const autoSaveRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<string>('');
  
  // Typing analytics
  const typingStartRef = useRef<number>(0);
  const wordsTypedRef = useRef<number>(0);

  useEffect(() => {
    // Load existing chapter content
    if (project.chapters && project.chapters[currentChapter]) {
      const chapterContent = project.chapters[currentChapter].content || '';
      setContent(chapterContent);
      setHistory([chapterContent]);
      setHistoryIndex(0);
    } else {
      setContent('');
      setHistory(['']);
      setHistoryIndex(0);
    }
  }, [currentChapter, project.chapters]);

  useEffect(() => {
    // Update word count and reading time
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 250)); // Average reading speed
  }, [content]);

  useEffect(() => {
    // Auto-save functionality
    if (content !== lastSaveRef.current) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      
      autoSaveRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }
    
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [content]);

  const handleAutoSave = async () => {
    if (content === lastSaveRef.current) return;
    
    setIsAutoSaving(true);
    try {
      // Update project with current content
      const updatedProject = { ...project };
      if (!updatedProject.chapters) updatedProject.chapters = [];
      
      updatedProject.chapters[currentChapter] = {
        ...updatedProject.chapters[currentChapter],
        id: currentChapter,
        title: `Chapter ${currentChapter + 1}`,
        content: content,
        summary: project.outline[currentChapter] || '',
        wordCount: wordCount
      };
      
      onUpdateProject(updatedProject);
      lastSaveRef.current = content;
      
      if (soundEnabled) {
        // Play save sound (you can add actual audio here)
        console.log('Auto-saved');
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    // Track typing speed
    if (!typingStartRef.current) {
      typingStartRef.current = Date.now();
      wordsTypedRef.current = 0;
    }
    
    const newWordCount = newContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    const oldWordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    if (newWordCount > oldWordCount) {
      wordsTypedRef.current += (newWordCount - oldWordCount);
      const timeElapsed = (Date.now() - typingStartRef.current) / 60000; // minutes
      setTypingSpeed(Math.round(wordsTypedRef.current / timeElapsed) || 0);
    }
    
    setContent(newContent);
    
    // Add to history for undo/redo
    if (newContent !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleGenerateChapter = async () => {
    setIsGenerating(true);
    try {
      const result = await generateChapter(currentChapter);
      if (result) {
        setContent(result.content);
        setHistory([result.content]);
        setHistoryIndex(0);
      }
    } catch (err) {
      console.error('Failed to generate chapter:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const themeClasses = isDarkMode 
    ? 'bg-slate-900 text-slate-100' 
    : 'bg-white text-slate-900';

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} ${themeClasses} transition-colors duration-300`}>
      <div className="h-full flex flex-col">
        {/* Enhanced Toolbar */}
        <div className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Chapter {currentChapter + 1}</span>
              </div>
              
              {showStats && (
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Type className="h-4 w-4" />
                    <span>{wordCount} words</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime} min read</span>
                  </div>
                  {typingSpeed > 0 && (
                    <div className="flex items-center space-x-1">
                      <Zap className="h-4 w-4" />
                      <span>{typingSpeed} wpm</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Writing Tools */}
              <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex === history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
              
              {/* View Controls */}
              <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Font Size */}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className={`text-sm border rounded px-2 py-1 ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-600 text-slate-100' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">X-Large</option>
              </select>
              
              {/* Action Buttons */}
              <Button
                onClick={handleGenerateChapter}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Button>
              
              <Button
                onClick={() => setIsFullscreen(!isFullscreen)}
                variant="ghost"
                size="sm"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Auto-save indicator */}
          {isAutoSaving && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Auto-saving...</span>
            </div>
          )}
        </div>

        {/* Writing Area */}
        <div className="flex-1 flex">
          {/* Main Editor */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              {isGenerating ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                      AI is crafting your chapter...
                    </p>
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      This may take a few moments
                    </p>
                  </div>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start writing your chapter here, or use AI Generate to create content..."
                  className={`w-full h-full min-h-[600px] p-6 border-none resize-none focus:outline-none font-serif leading-relaxed ${
                    fontSizeClasses[fontSize as keyof typeof fontSizeClasses]
                  } ${themeClasses}`}
                  style={{ 
                    background: 'transparent',
                    lineHeight: '1.8'
                  }}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          {!isFullscreen && (
            <div className={`w-80 border-l ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} p-6 space-y-6`}>
              {/* Chapter Navigation */}
              <div>
                <h3 className="font-semibold mb-3">Chapters</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {project.outline?.map((chapter: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentChapter(index)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                        index === currentChapter
                          ? isDarkMode 
                            ? 'bg-blue-900 text-blue-100' 
                            : 'bg-blue-100 text-blue-900'
                          : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Chapter {index + 1}</span>
                        {project.chapters && project.chapters[index] && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                      </div>
                      <p className="text-xs opacity-75 line-clamp-2">
                        {chapter.length > 50 ? chapter.substring(0, 50) + '...' : chapter}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Writing Goals */}
              <div>
                <h3 className="font-semibold mb-3">Today's Goals</h3>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Daily Word Goal</span>
                      <span>500 / 1000</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Chapter Progress</span>
                      <span>{Math.round((currentChapter + 1) / project.outline?.length * 100)}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(currentChapter + 1) / project.outline?.length * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Chapter
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Chapter
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Draft
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}