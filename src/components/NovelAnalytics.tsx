import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Target, BookOpen, Users } from 'lucide-react';

interface NovelAnalyticsProps {
  project: any;
  generatedContent: string;
}

export default function NovelAnalytics({ project, generatedContent }: NovelAnalyticsProps) {
  const calculateStats = () => {
    const totalWords = generatedContent.split(' ').length;
    const totalParagraphs = generatedContent.split('\n\n').length;
    const avgWordsPerParagraph = Math.round(totalWords / totalParagraphs) || 0;
    const readingTime = Math.ceil(totalWords / 250); // Average reading speed
    
    const sentenceCount = generatedContent.split(/[.!?]+/).length - 1;
    const avgWordsPerSentence = Math.round(totalWords / sentenceCount) || 0;
    
    // Estimate completion based on target length
    const targetWords = {
      short: 25000,
      medium: 65000,
      long: 100000
    }[project.targetLength] || 65000;
    
    const completionPercentage = Math.round((totalWords / targetWords) * 100);
    
    return {
      totalWords,
      totalParagraphs,
      avgWordsPerParagraph,
      readingTime,
      sentenceCount,
      avgWordsPerSentence,
      targetWords,
      completionPercentage
    };
  };

  const stats = calculateStats();

  const analyticsCards = [
    {
      title: 'Total Words',
      value: stats.totalWords.toLocaleString(),
      icon: BookOpen,
      color: 'blue',
      subtitle: `${stats.completionPercentage}% of target`
    },
    {
      title: 'Reading Time',
      value: `${stats.readingTime} min`,
      icon: Clock,
      color: 'green',
      subtitle: 'Estimated reading time'
    },
    {
      title: 'Paragraphs',
      value: stats.totalParagraphs,
      icon: BarChart3,
      color: 'purple',
      subtitle: `${stats.avgWordsPerParagraph} words avg`
    },
    {
      title: 'Progress',
      value: `${Math.round(project.progress || 0)}%`,
      icon: Target,
      color: 'orange',
      subtitle: `${project.outline?.length || 0} chapters planned`
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-slate-900">Novel Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {analyticsCards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600'
          };

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
              </div>
              <h4 className="font-medium text-slate-700">{card.title}</h4>
              <p className="text-xs text-slate-500">{card.subtitle}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Visualization */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Novel Completion</span>
            <span>{stats.completionPercentage}% of target length</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stats.completionPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <span className="text-slate-600">Avg Sentence Length</span>
            <div className="font-semibold text-slate-900">{stats.avgWordsPerSentence} words</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <span className="text-slate-600">Target Remaining</span>
            <div className="font-semibold text-slate-900">
              {Math.max(0, stats.targetWords - stats.totalWords).toLocaleString()} words
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}