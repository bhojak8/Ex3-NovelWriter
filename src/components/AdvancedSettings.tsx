import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Cpu, Zap, Brain, Sliders, Save } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';

interface AdvancedSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSave: (settings: any) => void;
}

export default function AdvancedSettings({ isOpen, onClose, settings, onSave }: AdvancedSettingsProps) {
  const [localSettings, setLocalSettings] = useState({
    temperature: settings.temperature || 0.9,
    maxTokens: settings.maxTokens || 4096,
    topK: settings.topK || 40,
    topP: settings.topP || 0.9,
    repetitionPenalty: settings.repetitionPenalty || 1.1,
    systemPrompt: settings.systemPrompt || '',
    chapterLength: settings.chapterLength || 'medium',
    writingTone: settings.writingTone || 'balanced',
    narrativeStyle: settings.narrativeStyle || 'descriptive',
    pacing: settings.pacing || 'moderate',
    ...settings
  });

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">Advanced AI Settings</h2>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* AI Model Parameters */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Cpu className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900">AI Model Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temperature ({localSettings.temperature})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">Controls creativity vs consistency</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Tokens
                </label>
                <Input
                  type="number"
                  value={localSettings.maxTokens}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  min="512"
                  max="8192"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Top K ({localSettings.topK})
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={localSettings.topK}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, topK: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Top P ({localSettings.topP})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={localSettings.topP}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Writing Style Controls */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-900">Writing Style Controls</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Chapter Length
                </label>
                <Select
                  value={localSettings.chapterLength}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, chapterLength: value }))}
                >
                  <option value="short">Short (800-1200 words)</option>
                  <option value="medium">Medium (1200-2000 words)</option>
                  <option value="long">Long (2000-3000 words)</option>
                  <option value="epic">Epic (3000+ words)</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Writing Tone
                </label>
                <Select
                  value={localSettings.writingTone}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, writingTone: value }))}
                >
                  <option value="formal">Formal & Literary</option>
                  <option value="balanced">Balanced</option>
                  <option value="casual">Casual & Conversational</option>
                  <option value="dramatic">Dramatic & Intense</option>
                  <option value="humorous">Light & Humorous</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Narrative Style
                </label>
                <Select
                  value={localSettings.narrativeStyle}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, narrativeStyle: value }))}
                >
                  <option value="descriptive">Highly Descriptive</option>
                  <option value="balanced">Balanced Description</option>
                  <option value="dialogue-heavy">Dialogue Heavy</option>
                  <option value="action-focused">Action Focused</option>
                  <option value="introspective">Character Introspective</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Story Pacing
                </label>
                <Select
                  value={localSettings.pacing}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, pacing: value }))}
                >
                  <option value="slow">Slow & Contemplative</option>
                  <option value="moderate">Moderate</option>
                  <option value="fast">Fast-Paced</option>
                  <option value="variable">Variable Pacing</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Custom System Prompt */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-slate-900">Custom System Prompt</h3>
            </div>
            
            <Textarea
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
              placeholder="Enter custom instructions for the AI writer..."
              rows={4}
            />
            <p className="text-xs text-slate-500 mt-2">
              Custom instructions will be added to every generation request
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}