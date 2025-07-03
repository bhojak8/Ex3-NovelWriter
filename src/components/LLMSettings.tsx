import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Server, Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import LocalLLMService from '../services/localLLMService';

interface LLMSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: { baseUrl: string; model: string; apiKey?: string }) => void;
}

const PRESET_CONFIGS = [
  { name: 'Ollama (Default)', baseUrl: 'http://localhost:11434', model: 'llama3.1:8b' },
  { name: 'LM Studio', baseUrl: 'http://localhost:1234', model: 'local-model' },
  { name: 'Text Generation WebUI', baseUrl: 'http://localhost:5000', model: 'local-model' },
  { name: 'vLLM', baseUrl: 'http://localhost:8000', model: 'local-model' },
  { name: 'Custom', baseUrl: '', model: '' }
];

export default function LLMSettings({ isOpen, onClose, onSave }: LLMSettingsProps) {
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434');
  const [model, setModel] = useState('llama3.1:8b');
  const [apiKey, setApiKey] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('Ollama (Default)');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load saved LLM config from localStorage
    const savedBaseUrl = localStorage.getItem('llm_base_url');
    const savedModel = localStorage.getItem('llm_model');
    const savedApiKey = localStorage.getItem('llm_api_key');
    
    if (savedBaseUrl) setBaseUrl(savedBaseUrl);
    if (savedModel) setModel(savedModel);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = PRESET_CONFIGS.find(p => p.name === presetName);
    if (preset && preset.name !== 'Custom') {
      setBaseUrl(preset.baseUrl);
      setModel(preset.model);
    }
  };

  const testConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    try {
      const llmService = new LocalLLMService({ baseUrl, model, apiKey: apiKey || undefined });
      const isConnected = await llmService.testConnection();
      
      if (isConnected) {
        setConnectionStatus('success');
        // Try to get available models
        const models = await llmService.getAvailableModels();
        setAvailableModels(models);
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    }
    
    setIsConnecting(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('llm_base_url', baseUrl);
    localStorage.setItem('llm_model', model);
    localStorage.setItem('llm_api_key', apiKey);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave({ baseUrl, model, apiKey: apiKey || undefined });
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
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg mx-4"
      >
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Server className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Local LLM Settings</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Local LLM Required</p>
                <p>Configure your local LLM server (Ollama, LM Studio, etc.) to use the AI writing features. No external API keys needed!</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Preset Configuration
            </label>
            <Select
              value={selectedPreset}
              onValueChange={handlePresetChange}
            >
              {PRESET_CONFIGS.map(preset => (
                <option key={preset.name} value={preset.name}>{preset.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Server className="h-4 w-4 inline mr-2" />
              Base URL
            </label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              The base URL of your local LLM server
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Model Name
            </label>
            {availableModels.length > 0 ? (
              <Select
                value={model}
                onValueChange={setModel}
              >
                {availableModels.map(modelName => (
                  <option key={modelName} value={modelName}>{modelName}</option>
                ))}
              </Select>
            ) : (
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="llama3.1:8b"
                className="font-mono text-sm"
              />
            )}
            <p className="text-xs text-slate-500 mt-1">
              The model name to use for generation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              API Key (Optional)
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave empty for local models"
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Only needed for some hosted local LLM services
            </p>
          </div>

          {/* Connection Test */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Connection Test</span>
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={isConnecting || !baseUrl}
              >
                {isConnecting ? (
                  <>
                    <Loader className="h-3 w-3 mr-1 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
            </div>
            
            {connectionStatus !== 'idle' && (
              <div className={`flex items-center space-x-2 text-sm ${
                connectionStatus === 'success' ? 'text-green-600' : 
                connectionStatus === 'error' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {connectionStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                {connectionStatus === 'error' && <AlertCircle className="h-4 w-4" />}
                {connectionStatus === 'connecting' && <Loader className="h-4 w-4 animate-spin" />}
                <span>
                  {connectionStatus === 'success' && 'Connected successfully!'}
                  {connectionStatus === 'error' && 'Connection failed. Check your settings.'}
                  {connectionStatus === 'connecting' && 'Testing connection...'}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!baseUrl || !model || isSaving}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
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