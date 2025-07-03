import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, BookOpen, Users, MapPin, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';

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
  const [currentChapter, setCurrentChapter] = useState(0);
  const [generatedText, setGeneratedText] = useState('');
  const [entities, setEntities] = useState({
    characters: ['Alex Chen', 'Dr. Sarah Martinez', 'The Mysterious Stranger'],
    locations: ['The Ancient Library', 'Moonlit Forest', 'Underground Laboratory']
  });
  const [writingStats, setWritingStats] = useState({
    wordsWritten: 2847,
    timeElapsed: '1h 23m',
    estimatedCompletion: '4h 15m'
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWriting) {
      interval = setInterval(() => {
        // Simulate writing progress
        const newText = generateNextSentence();
        setGeneratedText(prev => prev + ' ' + newText);
        
        setWritingStats(prev => ({
          ...prev,
          wordsWritten: prev.wordsWritten + Math.floor(Math.random() * 15) + 5
        }));
      }, 2000);
    }
    
    return () => clearInterval(interval);
  }, [isWriting]);

  const generateNextSentence = () => {
    const sentences = [
      "The ancient tome glowed with an otherworldly light as Alex approached.",
      "Dr. Martinez studied the readings with growing concern.",
      "Shadows danced across the library walls, seeming to move with purpose.",
      "The artifact pulsed with energy, responding to Alex's touch.",
      "A distant sound echoed through the corridors, growing closer.",
      "The mysterious stranger stepped from the shadows, eyes gleaming.",
      "Ancient symbols began to appear on the walls, glowing faintly.",
      "The ground trembled as something stirred deep beneath the library."
    ];
    
    return sentences[Math.floor(Math.random() * sentences.length)];
  };

  const progress = ((currentChapter + 1) / project.outline.length) * 100;

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
                  Resume Writing
                </>
              )}
            </Button>
            
            <Button variant="outline">
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
            Current Chapter: {project.outline[currentChapter]}
          </h3>
          <p className="text-slate-600 text-sm">
            {isWriting ? 'AI is actively writing...' : 'Writing paused'}
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
                <p className="text-slate-700 leading-relaxed">
                  {generatedText}
                  {isWriting && (
                    <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse"></span>
                  )}
                </p>
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
                <span className="text-slate-600">Est. Completion</span>
                <span className="font-semibold text-slate-900">{writingStats.estimatedCompletion}</span>
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
                  {entities.characters.map((character, index) => (
                    <div key={index} className="text-sm text-slate-600 bg-slate-50 rounded px-2 py-1">
                      {character}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-slate-700">Locations</span>
                </div>
                <div className="space-y-1">
                  {entities.locations.map((location, index) => (
                    <div key={index} className="text-sm text-slate-600 bg-slate-50 rounded px-2 py-1">
                      {location}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}