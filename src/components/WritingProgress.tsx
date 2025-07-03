import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, BookOpen, Users, MapPin, Clock, RefreshCw, Edit3 } from 'lucide-react';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import RealTimeEditor from './RealTimeEditor';

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
  const [currentParagraph, setCurrentParagraph] = useState('');
  const [entities, setEntities] = useState({
    characters: ['Alex Chen', 'Dr. Sarah Martinez', 'The Mysterious Stranger'],
    locations: ['The Ancient Library', 'Moonlit Forest', 'Underground Laboratory']
  });
  const [writingStats, setWritingStats] = useState({
    wordsWritten: 2847,
    timeElapsed: '1h 23m',
    estimatedCompletion: '4h 15m',
    paragraphsWritten: 12,
    currentSpeed: '45 words/min'
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isWriting) {
      interval = setInterval(() => {
        // Simulate realistic novel writing with proper paragraphs
        const newContent = generateNovelContent();
        setCurrentParagraph(newContent.paragraph);
        
        // Add completed paragraph to the full text
        if (newContent.isComplete) {
          setGeneratedText(prev => {
            const newText = prev + (prev ? '\n\n' : '') + newContent.paragraph;
            return newText;
          });
          setCurrentParagraph('');
        }
        
        setWritingStats(prev => ({
          ...prev,
          wordsWritten: prev.wordsWritten + Math.floor(Math.random() * 20) + 10,
          paragraphsWritten: newContent.isComplete ? prev.paragraphsWritten + 1 : prev.paragraphsWritten
        }));
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [isWriting]);

  const generateNovelContent = () => {
    const novelParagraphs = [
      {
        paragraph: `The ancient library stood silent in the moonlight, its towering shelves casting long shadows across the marble floor. Alex Chen moved carefully between the stacks, her footsteps echoing in the vast chamber. The leather-bound tome she sought lay hidden somewhere in these endless rows of knowledge, waiting to reveal its secrets.`,
        isComplete: true
      },
      {
        paragraph: `"You shouldn't be here," a voice whispered from the darkness. Alex froze, her heart pounding as she turned toward the sound. Dr. Sarah Martinez emerged from behind a pillar, her usually kind eyes now filled with concern. "The library holds more than just books, Alex. Some knowledge comes with a price."`,
        isComplete: true
      },
      {
        paragraph: `The air grew thick with an otherworldly energy as Alex's fingers traced the spine of the mysterious volume. Ancient symbols began to glow along its binding, pulsing with a rhythm that matched her heartbeat. She could feel the power within, calling to something deep inside her soul—something she never knew existed.`,
        isComplete: true
      },
      {
        paragraph: `"The Codex of Shadows," Dr. Martinez breathed, recognition dawning in her eyes. "I thought it was just a legend." The book seemed to respond to her words, its glow intensifying. "Alex, you must understand—once you open that book, there's no going back. The knowledge it contains will change you forever."`,
        isComplete: true
      },
      {
        paragraph: `But Alex was beyond hearing warnings now. The book had already begun to open itself, pages turning of their own accord as whispers in an ancient language filled the air. The library around them started to shift and change, reality bending as the boundaries between worlds grew thin.`,
        isComplete: true
      },
      {
        paragraph: `A figure materialized from the shadows—tall, cloaked, with eyes that held the wisdom of centuries. "The Keeper," Dr. Martinez whispered, stepping protectively in front of Alex. "You've awakened him." The mysterious stranger regarded them both with an expression that was neither kind nor cruel, but infinitely patient.`,
        isComplete: true
      },
      {
        paragraph: `"The girl has the gift," the Keeper spoke, his voice echoing from everywhere and nowhere at once. "She can see what others cannot, touch what others fear to approach. But gifts such as these come with responsibility." He gestured toward the still-glowing tome. "Will you accept what you have awakened, child?"`,
        isComplete: true
      },
      {
        paragraph: `Alex felt the weight of destiny settling on her shoulders like a heavy cloak. The rational part of her mind screamed to run, to close the book and pretend none of this had happened. But her heart knew better. This moment had been waiting for her all her life, and she could no more turn away from it than she could stop breathing.`,
        isComplete: true
      }
    ];
    
    return novelParagraphs[Math.floor(Math.random() * novelParagraphs.length)];
  };

  const regenerateCurrentChapter = () => {
    setGeneratedText('');
    setCurrentParagraph('');
    // Simulate regeneration
    if (isWriting) {
      onToggleWriting();
      setTimeout(() => onToggleWriting(), 1000);
    }
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
              onClick={regenerateCurrentChapter}
              variant="outline"
              disabled={isWriting}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            
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
        {/* Enhanced Writing Output */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Generated Novel Content</h3>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{writingStats.currentSpeed}</span>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {generatedText || currentParagraph ? (
              <div className="prose prose-lg max-w-none font-serif leading-relaxed">
                {/* Completed paragraphs */}
                {generatedText.split('\n\n').map((paragraph, index) => (
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
                
                {/* Currently being written paragraph */}
                {currentParagraph && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-800 mb-6 text-justify leading-8"
                  >
                    {currentParagraph}
                    {isWriting && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="inline-block w-0.5 h-6 bg-blue-600 ml-1"
                      />
                    )}
                  </motion.p>
                )}
                
                {/* Writing indicator */}
                {isWriting && !currentParagraph && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-3 text-blue-600 italic"
                  >
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Crafting the next paragraph...</span>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <BookOpen className="h-16 w-16 mx-auto mb-6 text-slate-300" />
                <h4 className="text-lg font-medium mb-2">Ready to Begin</h4>
                <p>Click "Resume Writing" to start generating your novel content</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Enhanced Writing Stats */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Writing Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Words Written</span>
                <span className="font-semibold text-slate-900">{writingStats.wordsWritten.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Paragraphs</span>
                <span className="font-semibold text-slate-900">{writingStats.paragraphsWritten}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Writing Speed</span>
                <span className="font-semibold text-slate-900">{writingStats.currentSpeed}</span>
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

          {/* Enhanced Entity Tracker */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Story Elements</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-700">Active Characters</span>
                </div>
                <div className="space-y-2">
                  {entities.characters.map((character, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-slate-700">{character}</span>
                      <span className="text-xs text-slate-500 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Ch. {currentChapter + 1}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-slate-700">Current Locations</span>
                </div>
                <div className="space-y-2">
                  {entities.locations.map((location, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-slate-700">{location}</span>
                      <span className="text-xs text-slate-500 bg-green-100 text-green-700 px-2 py-1 rounded">
                        Active
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Chapter Navigation</h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
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
                    {index < currentChapter && (
                      <span className="text-xs text-green-600">✓ Complete</span>
                    )}
                    {index === currentChapter && (
                      <span className="text-xs text-blue-600">● Writing</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {chapter.length > 60 ? chapter.substring(0, 60) + '...' : chapter}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}