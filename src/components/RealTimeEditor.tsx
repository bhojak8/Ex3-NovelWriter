import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Undo, Redo, Eye, Edit3 } from 'lucide-react';
import { Button } from './ui/Button';

interface RealTimeEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  isGenerating: boolean;
  onSave: () => void;
}

export default function RealTimeEditor({ 
  content, 
  onContentChange, 
  isGenerating, 
  onSave 
}: RealTimeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalContent(content);
    if (content !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(content);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [content]);

  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent);
    onContentChange(newContent);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousContent = history[newIndex];
      setLocalContent(previousContent);
      onContentChange(previousContent);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextContent = history[newIndex];
      setLocalContent(nextContent);
      onContentChange(nextContent);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Editor Toolbar */}
      <div className="border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? 'bg-blue-100 text-blue-700' : ''}
          >
            {isEditing ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            {isEditing ? 'Preview' : 'Edit'}
          </Button>
          
          <div className="h-4 w-px bg-slate-300" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex === 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex === history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {isGenerating && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">AI Writing...</span>
            </div>
          )}
          
          <Button onClick={onSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        {isEditing ? (
          <textarea
            ref={editorRef}
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-96 p-6 border-none resize-none focus:outline-none font-serif text-lg leading-relaxed"
            placeholder="Your story will appear here..."
          />
        ) : (
          <div className="p-6 h-96 overflow-y-auto">
            <div className="prose prose-lg max-w-none font-serif">
              {localContent ? (
                <div className="whitespace-pre-wrap">{localContent}</div>
              ) : (
                <p className="text-slate-400 italic">Your story will appear here...</p>
              )}
              
              {isGenerating && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-2 h-6 bg-blue-600 ml-1"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}