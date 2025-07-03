import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, Save, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface APISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { geminiApiKey: string; perplexityApiKey: string }) => void;
}

export default function APISettings({ isOpen, onClose, onSave }: APISettingsProps) {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [perplexityApiKey, setPerplexityApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load saved API keys from localStorage
    const savedGemini = localStorage.getItem('gemini_api_key');
    const savedPerplexity = localStorage.getItem('perplexity_api_key');
    
    if (savedGemini) setGeminiApiKey(savedGemini);
    if (savedPerplexity) setPerplexityApiKey(savedPerplexity);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('gemini_api_key', geminiApiKey);
    localStorage.setItem('perplexity_api_key', perplexityApiKey);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave({ geminiApiKey, perplexityApiKey });
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md mx-4"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">API Settings</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">API Keys Required</p>
                <p>You need API keys from Google (Gemini) and Perplexity to use the AI writing features. Your keys are stored locally and never sent to our servers.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Key className="h-4 w-4 inline mr-2" />
              Gemini Pro API Key
            </label>
            <Input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Get your key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Key className="h-4 w-4 inline mr-2" />
              Perplexity API Key
            </label>
            <Input
              type="password"
              value={perplexityApiKey}
              onChange={(e) => setPerplexityApiKey(e.target.value)}
              placeholder="Enter your Perplexity API key..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Get your key from <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Perplexity Settings</a>
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!geminiApiKey || !perplexityApiKey || isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}