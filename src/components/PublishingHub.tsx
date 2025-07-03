import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Globe, BookOpen, Star, Download, Share2, 
  Eye, Heart, MessageCircle, TrendingUp, Award,
  Settings, Lock, Unlock, Calendar, Target, Zap
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';

interface PublishingHubProps {
  project: any;
  onPublish: (settings: any) => void;
}

export default function PublishingHub({ project, onPublish }: PublishingHubProps) {
  const [activeTab, setActiveTab] = useState<'publish' | 'analytics' | 'promotion'>('publish');
  const [publishSettings, setPublishSettings] = useState({
    title: project.title,
    description: '',
    genre: project.genre,
    tags: [],
    coverImage: '',
    pricing: 'free',
    visibility: 'public',
    ageRating: 'general',
    language: 'english',
    publishDate: 'now'
  });

  const [analytics] = useState({
    views: 1247,
    likes: 89,
    comments: 23,
    downloads: 156,
    rating: 4.2,
    followers: 45
  });

  const tabs = [
    { id: 'publish', label: 'Publish', icon: Upload },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'promotion', label: 'Promotion', icon: Star }
  ];

  const platforms = [
    { id: 'ex3-community', name: 'Ex3 Community', icon: '🏠', enabled: true },
    { id: 'wattpad', name: 'Wattpad', icon: '📚', enabled: false },
    { id: 'amazon-kindle', name: 'Amazon Kindle', icon: '📖', enabled: false },
    { id: 'medium', name: 'Medium', icon: '✍️', enabled: false },
    { id: 'personal-blog', name: 'Personal Blog', icon: '🌐', enabled: false }
  ];

  const handlePublish = () => {
    onPublish(publishSettings);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Globe className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-semibold text-slate-900">Publishing Hub</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status === 'completed' ? 'Ready to Publish' : 'In Progress'}
          </span>
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
      {activeTab === 'publish' && (
        <div className="space-y-6">
          {/* Publishing Platforms */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Publishing Platforms</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map(platform => (
                <div
                  key={platform.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    platform.enabled 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <h5 className="font-medium text-slate-900">{platform.name}</h5>
                        <p className="text-sm text-slate-600">
                          {platform.enabled ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={platform.enabled ? 'default' : 'outline'}
                      size="sm"
                    >
                      {platform.enabled ? 'Publish' : 'Connect'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publication Settings */}
          <div className="border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-4">Publication Settings</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Publication Title
                  </label>
                  <Input
                    value={publishSettings.title}
                    onChange={(e) => setPublishSettings(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Genre
                  </label>
                  <Select
                    value={publishSettings.genre}
                    onValueChange={(value) => setPublishSettings(prev => ({ ...prev, genre: value }))}
                  >
                    <option value="fantasy">Fantasy</option>
                    <option value="romance">Romance</option>
                    <option value="mystery">Mystery</option>
                    <option value="sci-fi">Science Fiction</option>
                    <option value="thriller">Thriller</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={publishSettings.description}
                  onChange={(e) => setPublishSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Write a compelling description for your novel..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Visibility
                  </label>
                  <Select
                    value={publishSettings.visibility}
                    onValueChange={(value) => setPublishSettings(prev => ({ ...prev, visibility: value }))}
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pricing
                  </label>
                  <Select
                    value={publishSettings.pricing}
                    onValueChange={(value) => setPublishSettings(prev => ({ ...prev, pricing: value }))}
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="pay-what-you-want">Pay What You Want</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Age Rating
                  </label>
                  <Select
                    value={publishSettings.ageRating}
                    onValueChange={(value) => setPublishSettings(prev => ({ ...prev, ageRating: value }))}
                  >
                    <option value="general">General Audiences</option>
                    <option value="teen">Teen (13+)</option>
                    <option value="mature">Mature (17+)</option>
                    <option value="adult">Adult (18+)</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  onClick={handlePublish}
                  disabled={project.status !== 'completed'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Publish Novel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Views', value: analytics.views.toLocaleString(), icon: Eye, color: 'blue' },
              { label: 'Likes', value: analytics.likes, icon: Heart, color: 'red' },
              { label: 'Comments', value: analytics.comments, icon: MessageCircle, color: 'green' },
              { label: 'Downloads', value: analytics.downloads, icon: Download, color: 'purple' }
            ].map((metric, index) => {
              const Icon = metric.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                red: 'bg-red-100 text-red-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600'
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

          {/* Rating and Engagement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Reader Rating</h4>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">{analytics.rating}</div>
                <div className="flex justify-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.floor(analytics.rating) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600">Based on 47 reviews</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Engagement</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Read Completion</span>
                  <span className="font-medium">73%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg. Reading Time</span>
                  <span className="font-medium">12 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Followers Gained</span>
                  <span className="font-medium">+{analytics.followers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'promotion' && (
        <div className="space-y-6">
          {/* Promotion Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-blue-600" />
                Social Media
              </h4>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📘</span>
                  Share on Facebook
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">🐦</span>
                  Share on Twitter
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📸</span>
                  Share on Instagram
                </Button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Contests & Features
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-medium text-yellow-800">Monthly Writing Contest</h5>
                  <p className="text-sm text-yellow-700">Submit your novel for a chance to be featured</p>
                  <Button size="sm" className="mt-2">Submit</Button>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-800">Editor's Pick</h5>
                  <p className="text-sm text-blue-700">Apply for editorial review and promotion</p>
                  <Button size="sm" variant="outline" className="mt-2">Apply</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Tips */}
          <div className="bg-slate-50 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Marketing Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-slate-900">Engage with Readers</h5>
                    <p className="text-sm text-slate-600">Respond to comments and build a community</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-slate-900">Regular Updates</h5>
                    <p className="text-sm text-slate-600">Post new chapters consistently</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-slate-900">Cross-Promote</h5>
                    <p className="text-sm text-slate-600">Collaborate with other authors</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-slate-900">Use Analytics</h5>
                    <p className="text-sm text-slate-600">Track performance and optimize</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}