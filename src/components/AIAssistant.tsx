import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Bot, User, Lightbulb, BookOpen, 
  Users, MapPin, Zap, RefreshCw, Copy, ThumbsUp, ThumbsDown,
  Sparkles, Brain, Target, Wand2
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  project: any;
  currentChapter: number;
  onApplySuggestion: (suggestion: string) => void;
}

export default function AIAssistant({ project, currentChapter, onApplySuggestion }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI writing assistant. I can help you with plot development, character creation, dialogue improvement, and more. What would you like to work on for "${project.title}"?`,
      timestamp: new Date(),
      suggestions: [
        'Help me develop this character',
        'Suggest plot twists',
        'Improve this dialogue',
        'Create a scene description'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, project, currentChapter);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string, project: any, chapterIndex: number): Message => {
    const responses = {
      character: {
        content: `For character development in "${project.title}", consider these aspects:\n\n• **Motivation**: What drives your character's actions?\n• **Conflict**: Internal struggles that create depth\n• **Growth Arc**: How will they change throughout the story?\n• **Relationships**: How do they interact with others?\n\nWould you like me to help develop a specific character?`,
        suggestions: ['Create character backstory', 'Develop character flaws', 'Design character relationships']
      },
      plot: {
        content: `Here are some plot development ideas for your ${project.genre} novel:\n\n• **Raise the Stakes**: Increase tension by adding time pressure or higher consequences\n• **Unexpected Ally**: Introduce a character who helps in an surprising way\n• **Hidden Truth**: Reveal something that changes everything\n• **Moral Dilemma**: Force your protagonist to make a difficult choice\n\nWhich direction interests you most?`,
        suggestions: ['Add plot twist', 'Increase tension', 'Develop subplot', 'Create cliffhanger']
      },
      dialogue: {
        content: `To improve dialogue in your story:\n\n• **Voice**: Each character should sound unique\n• **Subtext**: Characters often don't say what they really mean\n• **Conflict**: Dialogue should reveal tension or advance plot\n• **Natural Flow**: Read it aloud to check if it sounds realistic\n\nShare a dialogue snippet and I'll help you enhance it!`,
        suggestions: ['Make dialogue more natural', 'Add subtext', 'Create character voice', 'Improve pacing']
      },
      scene: {
        content: `For compelling scene writing:\n\n• **Setting**: Use sensory details to immerse readers\n• **Purpose**: Every scene should advance plot or develop character\n• **Tension**: Include conflict or anticipation\n• **Pacing**: Vary sentence length for rhythm\n\nWhat type of scene are you working on?`,
        suggestions: ['Describe setting', 'Add sensory details', 'Create atmosphere', 'Build tension']
      }
    };

    const input = userInput.toLowerCase();
    let responseType = 'general';

    if (input.includes('character') || input.includes('protagonist') || input.includes('antagonist')) {
      responseType = 'character';
    } else if (input.includes('plot') || input.includes('story') || input.includes('twist')) {
      responseType = 'plot';
    } else if (input.includes('dialogue') || input.includes('conversation') || input.includes('speech')) {
      responseType = 'dialogue';
    } else if (input.includes('scene') || input.includes('setting') || input.includes('description')) {
      responseType = 'scene';
    }

    const response = responses[responseType as keyof typeof responses] || {
      content: `I understand you're asking about "${userInput}". Let me help you with that in the context of your ${project.genre} novel. Could you provide more specific details about what you'd like to explore?`,
      suggestions: ['Develop characters', 'Improve plot', 'Enhance dialogue', 'Create scenes']
    };

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleApplySuggestion = (suggestion: string) => {
    onApplySuggestion(suggestion);
  };

  const quickActions = [
    { icon: Users, label: 'Character Help', prompt: 'Help me develop a character for this chapter' },
    { icon: Lightbulb, label: 'Plot Ideas', prompt: 'Suggest plot developments for this chapter' },
    { icon: MessageCircle, label: 'Dialogue', prompt: 'Help me write better dialogue' },
    { icon: MapPin, label: 'Setting', prompt: 'Help me describe the setting for this scene' }
  ];

  return (
    <>
      {/* AI Assistant Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bot className="h-6 w-6 mx-auto" />
      </motion.button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-6 bottom-24 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-30 flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">AI Writing Assistant</h3>
                    <p className="text-xs text-slate-500">Chapter {currentChapter + 1}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  ×
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(action.prompt)}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm"
                    >
                      <Icon className="h-4 w-4 text-slate-600" />
                      <span className="text-slate-700">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-900'
                  } rounded-lg p-3`}>
                    <div className="flex items-start space-x-2">
                      {message.type === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 text-purple-600" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {message.suggestions && (
                          <div className="mt-3 space-y-1">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleApplySuggestion(suggestion)}
                                className="block w-full text-left text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-colors"
                              >
                                <Wand2 className="h-3 w-3 inline mr-1" />
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-purple-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your story..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}