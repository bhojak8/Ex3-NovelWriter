import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, BookOpen, Users, MapPin, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import NovelWriterService from '../services/novelWriterService';

interface WritingProgressProps {
  project: any;
  onUpdateProject: (project: any) => void;
  isWriting: boolean;
  onToggleWriting: () => void;
  novelWriterService?: NovelWriterService | null;
}

export default function WritingProgress({ 
  project, 
  onUpdateProject, 
  isWriting, 
  onToggleWriting,
  novelWriterService
}: WritingProgressProps) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [generatedText, setGeneratedText] = useState('');
  const [entities, setEntities] = useState({
    characters: [] as string[],
    locations: [] as string[]
  });
  const [writingStats, setWritingStats] = useState({
    wordsWritten: 0,
    timeElapsed: '0m',
    estimatedCompletion: 'Calculating...'
  });
  const [entityDatabase, setEntityDatabase] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWriting && novelWriterService) {
      interval = setInterval(async () => {
        await generateNextChapter();
      }, 5000); // Generate every 5 seconds for demo
    }
    
    return () => clearInterval(interval);
  }, [isWriting, currentChapter, novelWriterService]);

  const generateNextChapter = async () => {
    if (!novelWriterService || currentChapter >= project.outline.length) {
      setIsWriting(false);
      return;
    }

    try {
      const chapterOutline = project.outline[currentChapter];
      const previousSummary = currentChapter > 0 ? project.chapters[currentChapter - 1]?.summary : undefined;
      
      const { content, summary } = await novelWriterService.expandChapter(
        project,
        chapterOutline,
        currentChapter,
        previousSummary,
        entityDatabase
      );

      // Extract entities from the new content
      const extractedEntities = await novelWriterService.extractEntities(content);
      
      // Update entity database
      const updatedEntityDb = await novelWriterService.updateEntityDatabase(entityDatabase, content);
      setEntityDatabase(updatedEntityDb);

      // Update entities state
      setEntities(prev => ({
        characters: [...new Set([...prev.characters, ...extractedEntities.characters])],
        locations: [...new Set([...prev.locations, ...extractedEntities.locations])]
      }));

      // Add the new chapter
      const newChapter = {
        title: `Chapter ${currentChapter + 1}`,
        content,
        summary
      };

      const updatedProject = {
        ...project,
        chapters: [...(project.chapters || []), newChapter],
        progress: ((currentChapter + 1) / project.outline.length) * 100
      };

      onUpdateProject(updatedProject);
      setGeneratedText(prev => prev + '\n\n' + content);
      setCurrentChapter(prev => prev + 1);
      
      // Update stats
      setWritingStats(prev => ({
        ...prev,
        wordsWritten: prev.wordsWritten + content.split(' ').length,
        timeElapsed: `${Math.floor((currentChapter + 1) * 2)}m`
      }));

    } catch (error) {
      console.error('Error generating chapter:', error);
      alert('Error generating chapter. Please check your API configuration.');
      onToggleWriting();
    }
  };

  const progress = ((currentChapter) / project.outline.length) * 100;

  const exportNovel = () => {
    const novelContent = `${project.title}\n\n${project.premise}\n\n${generatedText}`;
    const blob = new Blob([novelContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Writing Controls */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Writing Progress</h2>
              <p className="text-slate-600">Chapter {currentChapter + 1} of {project.outline.length}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={onToggleWriting}
              disabled={!novelWriterService}
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
                  {currentChapter === 0 ? 'Start Writing' : 'Resume Writing'}
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={exportNovel} disabled={!generatedText}>
              <Download className="h-4 w-4 mr-2" />
              Export Draft
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

        {/* Current Chapter */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-2">
            {currentChapter < project.outline.length ? 
              `Current Chapter: ${project.outline[currentChapter]}` :
              'Novel Complete!'
            }
          </h3>
          <p className="text-slate-600 text-sm">
            {isWriting ? 'AI is actively writing...' : 
             currentChapter >= project.outline.length ? 'All chapters completed!' : 'Writing paused'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Writing Output */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Generated Content</h3>
          
          <div className="bg-slate-50 rounded-lg p-6 min-h-96 max-h-96 overflow-y-auto">
            {generatedText ? (
              <div className="prose prose-slate max-w-none">
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {generatedText}
                  {isWriting && (
                    <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse"></span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Start writing to see generated content appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Writing Stats */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Writing Stats</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Words Written</span>
                <span className="font-semibold text-slate-900">{writingStats.wordsWritten.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Time Elapsed</span>
                <span className="font-semibold text-slate-900">{writingStats.timeElapsed}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Chapters Done</span>
                <span className="font-semibold text-slate-900">{currentChapter} / {project.outline.length}</span>
              </div>
            </div>
          </div>

          {/* Entity Tracker */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Story Elements</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-700">Characters</span>
                </div>
                <div className="space-y-1">
                  {entities.characters.length > 0 ? entities.characters.map((character, index) => (
                    <div key={index} className="text-sm text-slate-600 bg-slate-50 rounded px-2 py-1">
                      {character}
                    </div>
                  )) : (
                    <div className="text-sm text-slate-400">No characters detected yet</div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-slate-700">Locations</span>
                </div>
                <div className="space-y-1">
                  {entities.locations.length > 0 ? entities.locations.map((location, index) => (
                    <div key={index} className="text-sm text-slate-600 bg-slate-50 rounded px-2 py-1">
                      {location}
                    </div>
                  )) : (
                    <div className="text-sm text-slate-400">No locations detected yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}