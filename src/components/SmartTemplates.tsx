import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Sparkles, Wand2, Download, Star, Clock,
  Users, MapPin, Heart, Sword, Rocket, Crown, Zap,
  Brain, Target, Eye, Copy, Plus
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';

interface Template {
  id: string;
  name: string;
  description: string;
  genre: string;
  icon: any;
  color: string;
  outline: string[];
  characterTypes: string[];
  themes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedLength: string;
  popularity: number;
}

interface SmartTemplatesProps {
  onSelectTemplate: (template: Template) => void;
  onCreateCustom: (template: Partial<Template>) => void;
}

export default function SmartTemplates({ onSelectTemplate, onCreateCustom }: SmartTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    description: '',
    genre: '',
    outline: [''],
    themes: []
  });

  const templates: Template[] = [
    {
      id: 'hero-journey',
      name: "The Hero's Journey",
      description: "Classic monomyth structure perfect for epic adventures and personal transformation stories.",
      genre: 'Fantasy',
      icon: Sword,
      color: 'from-amber-500 to-orange-600',
      outline: [
        "The Ordinary World - Introduce the hero in their normal environment",
        "The Call to Adventure - The inciting incident that starts the journey",
        "Refusal of the Call - Initial hesitation or fear",
        "Meeting the Mentor - Guidance and magical aid",
        "Crossing the Threshold - Entering the special world",
        "Tests, Allies, and Enemies - Challenges and character development",
        "Approach to the Inmost Cave - Preparing for the major challenge",
        "The Ordeal - The crisis point and greatest fear",
        "Reward (Seizing the Sword) - Surviving and gaining something",
        "The Road Back - Beginning the journey home",
        "Resurrection - Final test and transformation",
        "Return with the Elixir - Coming home changed"
      ],
      characterTypes: ['Hero', 'Mentor', 'Threshold Guardian', 'Herald', 'Shapeshifter', 'Shadow', 'Ally'],
      themes: ['Growth', 'Courage', 'Sacrifice', 'Transformation'],
      difficulty: 'intermediate',
      estimatedLength: 'medium',
      popularity: 95
    },
    {
      id: 'three-act',
      name: "Three-Act Structure",
      description: "Time-tested dramatic structure that works for most genres and story types.",
      genre: 'General',
      icon: BookOpen,
      color: 'from-blue-500 to-purple-600',
      outline: [
        "Setup - Introduce characters, world, and normal life",
        "Inciting Incident - The event that changes everything",
        "Plot Point 1 - Hero commits to the journey",
        "Rising Action - Obstacles and complications increase",
        "Midpoint - Major revelation or setback",
        "Plot Point 2 - All seems lost, darkest moment",
        "Climax - Final confrontation and resolution",
        "Falling Action - Consequences of the climax",
        "Resolution - New normal and character growth"
      ],
      characterTypes: ['Protagonist', 'Antagonist', 'Supporting Characters', 'Love Interest'],
      themes: ['Conflict', 'Resolution', 'Character Arc'],
      difficulty: 'beginner',
      estimatedLength: 'medium',
      popularity: 88
    },
    {
      id: 'romance-arc',
      name: "Romance Arc",
      description: "Perfect structure for love stories with emotional beats and relationship development.",
      genre: 'Romance',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      outline: [
        "Meet Cute - First encounter between love interests",
        "Attraction - Initial spark and interest",
        "Barrier - What keeps them apart",
        "Getting to Know You - Building connection",
        "First Kiss - Physical and emotional intimacy",
        "Relationship Building - Deepening bond",
        "Conflict - Major obstacle threatens relationship",
        "Dark Moment - All seems lost",
        "Grand Gesture - Proving love",
        "Happily Ever After - Resolution and commitment"
      ],
      characterTypes: ['Love Interest A', 'Love Interest B', 'Best Friend', 'Rival', 'Mentor'],
      themes: ['Love', 'Trust', 'Vulnerability', 'Growth'],
      difficulty: 'beginner',
      estimatedLength: 'medium',
      popularity: 82
    },
    {
      id: 'mystery-structure',
      name: "Mystery Structure",
      description: "Classic detective story format with clues, red herrings, and satisfying resolution.",
      genre: 'Mystery',
      icon: Eye,
      color: 'from-slate-600 to-slate-800',
      outline: [
        "The Crime - Mysterious event that needs solving",
        "Discovery - Crime is discovered and investigation begins",
        "Initial Investigation - Gathering first clues",
        "First Suspect - Initial theory and suspect",
        "Red Herring - False lead that misdirects",
        "Deeper Investigation - Uncovering hidden connections",
        "Second Crime - Escalation or related incident",
        "Breakthrough - Key clue or revelation",
        "Confrontation - Facing the real culprit",
        "Resolution - Explanation and justice"
      ],
      characterTypes: ['Detective', 'Victim', 'Suspect', 'Witness', 'Red Herring', 'Culprit'],
      themes: ['Justice', 'Truth', 'Deception', 'Logic'],
      difficulty: 'advanced',
      estimatedLength: 'medium',
      popularity: 76
    },
    {
      id: 'sci-fi-exploration',
      name: "Sci-Fi Exploration",
      description: "Space opera and scientific discovery template for futuristic adventures.",
      genre: 'Science Fiction',
      icon: Rocket,
      color: 'from-cyan-500 to-blue-600',
      outline: [
        "The Discovery - Scientific breakthrough or alien contact",
        "Preparation - Getting ready for the journey",
        "Launch - Beginning the expedition",
        "First Contact - Encountering the unknown",
        "Wonder and Danger - Marvels and threats",
        "Scientific Challenge - Problem requiring innovation",
        "Moral Dilemma - Ethical questions about progress",
        "Crisis - Everything goes wrong",
        "Innovation - Creative solution using science",
        "New Understanding - Expanded worldview",
        "Return Changed - Coming back with new knowledge"
      ],
      characterTypes: ['Scientist', 'Explorer', 'AI Companion', 'Alien', 'Skeptic', 'Visionary'],
      themes: ['Progress', 'Discovery', 'Ethics', 'Wonder'],
      difficulty: 'intermediate',
      estimatedLength: 'long',
      popularity: 71
    },
    {
      id: 'coming-of-age',
      name: "Coming of Age",
      description: "Perfect for young adult stories about growing up and finding identity.",
      genre: 'Young Adult',
      icon: Crown,
      color: 'from-green-500 to-emerald-600',
      outline: [
        "Childhood's End - Leaving innocence behind",
        "New Environment - School, move, or change",
        "Identity Crisis - Questioning who they are",
        "Peer Pressure - Social challenges and fitting in",
        "First Love - Romantic awakening",
        "Betrayal - Trust broken by friend or adult",
        "Rebellion - Acting out against authority",
        "Consequences - Learning from mistakes",
        "Wisdom Gained - Understanding life's complexity",
        "Acceptance - Embracing their true self",
        "Maturity - Ready to face adult world"
      ],
      characterTypes: ['Protagonist', 'Best Friend', 'Love Interest', 'Mentor', 'Bully', 'Parent'],
      themes: ['Identity', 'Growth', 'Friendship', 'Independence'],
      difficulty: 'beginner',
      estimatedLength: 'medium',
      popularity: 79
    }
  ];

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'beginner', label: 'Beginner Friendly' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'romance', label: 'Romance' },
    { id: 'mystery', label: 'Mystery' },
    { id: 'sci-fi', label: 'Sci-Fi' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.genre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' ||
                           (selectedCategory === 'beginner' && template.difficulty === 'beginner') ||
                           (selectedCategory === 'popular' && template.popularity > 80) ||
                           template.genre.toLowerCase().includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: Template['difficulty']) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty];
  };

  const addOutlinePoint = () => {
    setCustomTemplate(prev => ({
      ...prev,
      outline: [...prev.outline, '']
    }));
  };

  const updateOutlinePoint = (index: number, value: string) => {
    setCustomTemplate(prev => ({
      ...prev,
      outline: prev.outline.map((point, i) => i === index ? value : point)
    }));
  };

  const removeOutlinePoint = (index: number) => {
    setCustomTemplate(prev => ({
      ...prev,
      outline: prev.outline.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-slate-900">Smart Templates</h3>
        </div>
        
        <Button onClick={() => setShowCustomBuilder(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create Custom
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTemplates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 cursor-pointer transition-all hover:shadow-lg"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${template.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-slate-600">{template.popularity}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-slate-600 line-clamp-3">{template.description}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Genre:</span>
                    <span className="font-medium text-slate-700">{template.genre}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Length:</span>
                    <span className="font-medium text-slate-700">{template.estimatedLength}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Chapters:</span>
                    <span className="font-medium text-slate-700">{template.outline.length}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex flex-wrap gap-1">
                    {template.themes.slice(0, 3).map(theme => (
                      <span key={theme} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                        {theme}
                      </span>
                    ))}
                    {template.themes.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                        +{template.themes.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Custom Template Builder Modal */}
      <AnimatePresence>
        {showCustomBuilder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">Create Custom Template</h3>
                  <Button variant="ghost" onClick={() => setShowCustomBuilder(false)}>×</Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Template Name
                    </label>
                    <Input
                      value={customTemplate.name}
                      onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Custom Template"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Genre
                    </label>
                    <Input
                      value={customTemplate.genre}
                      onChange={(e) => setCustomTemplate(prev => ({ ...prev, genre: e.target.value }))}
                      placeholder="Fantasy, Romance, Mystery..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={customTemplate.description}
                    onChange={(e) => setCustomTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what makes this template unique..."
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Chapter Outline
                    </label>
                    <Button onClick={addOutlinePoint} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Chapter
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {customTemplate.outline.map((point, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-sm text-slate-500 w-8">{index + 1}.</span>
                        <Input
                          value={point}
                          onChange={(e) => updateOutlinePoint(index, e.target.value)}
                          placeholder="Chapter description..."
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOutlinePoint(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                  <Button variant="outline" onClick={() => setShowCustomBuilder(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      onCreateCustom(customTemplate);
                      setShowCustomBuilder(false);
                    }}
                    disabled={!customTemplate.name || !customTemplate.genre}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}