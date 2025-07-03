import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Clock, Target, BookOpen, Users, 
  Brain, Zap, Eye, Heart, MessageCircle, MapPin, Calendar,
  Award, Flame, Star, Activity, PieChart, LineChart
} from 'lucide-react';
import { Button } from './ui/Button';

interface AdvancedAnalyticsProps {
  project: any;
  generatedContent: string;
}

export default function AdvancedAnalytics({ project, generatedContent }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'writing' | 'story' | 'performance'>('overview');
  const [timeRange, setTimeRange] = useState('7d');

  const calculateAdvancedStats = () => {
    const words = generatedContent.split(/\s+/).filter(w => w.length > 0);
    const sentences = generatedContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = generatedContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Advanced metrics
    const avgWordsPerSentence = Math.round(words.length / sentences.length) || 0;
    const avgSentencesPerParagraph = Math.round(sentences.length / paragraphs.length) || 0;
    const readabilityScore = calculateReadabilityScore(words, sentences);
    const emotionalTone = analyzeEmotionalTone(generatedContent);
    const dialogueRatio = calculateDialogueRatio(generatedContent);
    const paceScore = calculatePaceScore(sentences);
    
    return {
      totalWords: words.length,
      totalSentences: sentences.length,
      totalParagraphs: paragraphs.length,
      avgWordsPerSentence,
      avgSentencesPerParagraph,
      readabilityScore,
      emotionalTone,
      dialogueRatio,
      paceScore,
      estimatedReadingTime: Math.ceil(words.length / 250),
      complexity: calculateComplexity(words),
      characterMentions: extractCharacterMentions(generatedContent),
      locationMentions: extractLocationMentions(generatedContent)
    };
  };

  const calculateReadabilityScore = (words: string[], sentences: string[]) => {
    if (sentences.length === 0) return 0;
    const avgWordsPerSentence = words.length / sentences.length;
    // Simplified Flesch Reading Ease approximation
    const score = 206.835 - (1.015 * avgWordsPerSentence);
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const analyzeEmotionalTone = (content: string) => {
    const positiveWords = ['happy', 'joy', 'love', 'wonderful', 'amazing', 'beautiful', 'hope', 'smile'];
    const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'fear', 'pain', 'dark'];
    const neutralWords = ['said', 'went', 'came', 'looked', 'walked', 'stood', 'sat'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positive = words.filter(w => positiveWords.some(pw => w.includes(pw))).length;
    const negative = words.filter(w => negativeWords.some(nw => w.includes(nw))).length;
    const neutral = words.filter(w => neutralWords.some(neu => w.includes(neu))).length;
    
    const total = positive + negative + neutral || 1;
    return {
      positive: Math.round((positive / total) * 100),
      negative: Math.round((negative / total) * 100),
      neutral: Math.round((neutral / total) * 100)
    };
  };

  const calculateDialogueRatio = (content: string) => {
    const dialogueMatches = content.match(/[""][^""]*[""]/g) || [];
    const totalWords = content.split(/\s+/).length;
    const dialogueWords = dialogueMatches.join(' ').split(/\s+/).length;
    return Math.round((dialogueWords / totalWords) * 100);
  };

  const calculatePaceScore = (sentences: string[]) => {
    if (sentences.length === 0) return 50;
    const shortSentences = sentences.filter(s => s.split(/\s+/).length < 10).length;
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 20).length;
    const ratio = (shortSentences + longSentences) / sentences.length;
    return Math.round(ratio * 100);
  };

  const calculateComplexity = (words: string[]) => {
    const complexWords = words.filter(w => w.length > 6).length;
    return Math.round((complexWords / words.length) * 100);
  };

  const extractCharacterMentions = (content: string) => {
    // Simple character extraction - in real app, this would be more sophisticated
    const names = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
    const uniqueNames = [...new Set(names)].slice(0, 10);
    return uniqueNames.map(name => ({
      name,
      mentions: (content.match(new RegExp(name, 'g')) || []).length
    }));
  };

  const extractLocationMentions = (content: string) => {
    const locationKeywords = ['castle', 'forest', 'city', 'town', 'village', 'mountain', 'river', 'ocean'];
    return locationKeywords.map(location => ({
      name: location,
      mentions: (content.toLowerCase().match(new RegExp(location, 'g')) || []).length
    })).filter(l => l.mentions > 0);
  };

  const stats = calculateAdvancedStats();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'writing', label: 'Writing Style', icon: Brain },
    { id: 'story', label: 'Story Elements', icon: BookOpen },
    { id: 'performance', label: 'Performance', icon: TrendingUp }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">Advanced Analytics</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-slate-300 rounded-md px-3 py-1"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Words', value: stats.totalWords.toLocaleString(), icon: BookOpen, color: 'blue' },
              { label: 'Reading Time', value: `${stats.estimatedReadingTime} min`, icon: Clock, color: 'green' },
              { label: 'Readability', value: `${stats.readabilityScore}/100`, icon: Eye, color: 'purple' },
              { label: 'Pace Score', value: `${stats.paceScore}%`, icon: Zap, color: 'orange' }
            ].map((metric, index) => {
              const Icon = metric.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600'
              };
              
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                  </div>
                  <h4 className="font-medium text-slate-700">{metric.label}</h4>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Writing Progress</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Novel Completion</span>
                    <span>{Math.round(project.progress || 0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Daily Goal</span>
                    <span>750 / 1000 words</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Emotional Tone</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Positive</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${stats.emotionalTone.positive}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{stats.emotionalTone.positive}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Negative</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${stats.emotionalTone.negative}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{stats.emotionalTone.negative}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Neutral</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-slate-500 h-2 rounded-full"
                        style={{ width: `${stats.emotionalTone.neutral}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{stats.emotionalTone.neutral}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'writing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Writing Style Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Avg Words/Sentence</span>
                  <span className="font-medium">{stats.avgWordsPerSentence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Avg Sentences/Paragraph</span>
                  <span className="font-medium">{stats.avgSentencesPerParagraph}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Dialogue Ratio</span>
                  <span className="font-medium">{stats.dialogueRatio}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Complexity Score</span>
                  <span className="font-medium">{stats.complexity}%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Readability Analysis</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.readabilityScore}</div>
                <div className="text-sm text-slate-600 mb-3">Readability Score</div>
                <div className="text-xs text-slate-500">
                  {stats.readabilityScore >= 80 ? 'Very Easy' :
                   stats.readabilityScore >= 60 ? 'Easy' :
                   stats.readabilityScore >= 40 ? 'Moderate' :
                   stats.readabilityScore >= 20 ? 'Difficult' : 'Very Difficult'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'story' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Character Mentions
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stats.characterMentions.map((char, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{char.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (char.mentions / Math.max(...stats.characterMentions.map(c => c.mentions))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{char.mentions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-green-600" />
                Location Mentions
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stats.locationMentions.map((loc, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 capitalize">{loc.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (loc.mentions / Math.max(...stats.locationMentions.map(l => l.mentions))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{loc.mentions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Writing Streak', value: '7 days', icon: Flame, color: 'orange' },
              { label: 'Best Day', value: '1,250 words', icon: Award, color: 'yellow' },
              { label: 'Avg Daily', value: '850 words', icon: Star, color: 'purple' }
            ].map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="bg-slate-50 rounded-lg p-4 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                  <div className="text-sm text-slate-600">{metric.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}