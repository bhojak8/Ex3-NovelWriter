import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Plus, Trash2, Settings, Wifi, WifiOff, 
  Cloud, HardDrive, Zap, Eye, EyeOff, RefreshCw,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { apiService, ModelInfo, ModelConfig } from '../services/api';

interface ModelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onModelSelect?: (modelName: string) => void;
}

export default function ModelManager({ isOpen, onClose, onModelSelect }: ModelManagerProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [healthStatus, setHealthStatus] = useState<Record<string, boolean>>({});
  const [localProviders, setLocalProviders] = useState<Record<string, any>>({});
  const [showAddModel, setShowAddModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newModel, setNewModel] = useState<Partial<ModelConfig>>({
    name: '',
    provider: 'openai',
    model_id: '',
    api_key: '',
    base_url: '',
    max_tokens: 4096,
    temperature: 0.9,
    top_p: 0.9,
    top_k: 40,
    custom_params: {}
  });

  useEffect(() => {
    if (isOpen) {
      loadModels();
      checkHealthStatus();
      scanLocalProviders();
    }
  }, [isOpen]);

  const loadModels = async () => {
    try {
      const modelList = await apiService.getAvailableModels();
      setModels(modelList);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const checkHealthStatus = async () => {
    try {
      const status = await apiService.checkAllModelsHealth();
      setHealthStatus(status);
    } catch (error) {
      console.error('Failed to check health status:', error);
    }
  };

  const scanLocalProviders = async () => {
    try {
      const providers = await apiService.scanLocalProviders();
      setLocalProviders(providers);
    } catch (error) {
      console.error('Failed to scan local providers:', error);
    }
  };

  const addModel = async () => {
    if (!newModel.name || !newModel.provider || !newModel.model_id) return;
    
    setIsLoading(true);
    try {
      await apiService.addModel(newModel as ModelConfig);
      await loadModels();
      setShowAddModel(false);
      setNewModel({
        name: '',
        provider: 'openai',
        model_id: '',
        api_key: '',
        base_url: '',
        max_tokens: 4096,
        temperature: 0.9,
        top_p: 0.9,
        top_k: 40,
        custom_params: {}
      });
    } catch (error) {
      console.error('Failed to add model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeModel = async (modelName: string) => {
    if (!confirm(`Are you sure you want to remove ${modelName}?`)) return;
    
    try {
      await apiService.removeModel(modelName);
      await loadModels();
    } catch (error) {
      console.error('Failed to remove model:', error);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
      case 'anthropic':
      case 'huggingface':
        return Cloud;
      case 'ollama':
      case 'llamacpp':
      case 'textgen':
        return HardDrive;
      default:
        return Cpu;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'text-green-600 bg-green-100';
      case 'anthropic':
        return 'text-orange-600 bg-orange-100';
      case 'huggingface':
        return 'text-yellow-600 bg-yellow-100';
      case 'ollama':
        return 'text-blue-600 bg-blue-100';
      case 'llamacpp':
        return 'text-purple-600 bg-purple-100';
      case 'textgen':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (modelName: string) => {
    const isHealthy = healthStatus[modelName];
    if (isHealthy === undefined) return AlertCircle;
    return isHealthy ? CheckCircle : XCircle;
  };

  const getHealthColor = (modelName: string) => {
    const isHealthy = healthStatus[modelName];
    if (isHealthy === undefined) return 'text-yellow-500';
    return isHealthy ? 'text-green-500' : 'text-red-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Cpu className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">AI Model Manager</h2>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={scanLocalProviders}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan Local
              </Button>
              <Button
                onClick={() => setShowAddModel(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
              <Button variant="ghost" onClick={onClose}>×</Button>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Local Providers Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Local Providers Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(localProviders).map(([provider, info]) => (
                <div
                  key={provider}
                  className={`border rounded-lg p-4 ${
                    info.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-5 w-5" />
                      <span className="font-medium capitalize">{provider}</span>
                    </div>
                    {info.available ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {info.available ? 'Available' : 'Not running'}
                  </p>
                  {info.models && (
                    <p className="text-xs text-slate-500 mt-1">
                      {info.models.length} models available
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Models List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Available Models</h3>
              <Button
                onClick={checkHealthStatus}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Health
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => {
                const ProviderIcon = getProviderIcon(model.provider);
                const HealthIcon = getHealthIcon(model.name);
                
                return (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-slate-900">{model.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProviderColor(model.provider)}`}>
                            {model.provider}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-2">{model.model}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <ProviderIcon className="h-3 w-3" />
                            <span>{model.local ? 'Local' : 'Cloud'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>{model.type}</span>
                          </div>
                          {model.supports_system_prompt && (
                            <div className="flex items-center space-x-1">
                              <span>System Prompt</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <HealthIcon className={`h-5 w-5 ${getHealthColor(model.name)}`} />
                        
                        {onModelSelect && (
                          <Button
                            onClick={() => onModelSelect(model.name)}
                            size="sm"
                            variant="outline"
                          >
                            Select
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => removeModel(model.name)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Add Model Form */}
          <AnimatePresence>
            {showAddModel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 border border-slate-200 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Model</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Model Name
                    </label>
                    <Input
                      value={newModel.name || ''}
                      onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="my-custom-model"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Provider
                    </label>
                    <Select
                      value={newModel.provider || 'openai'}
                      onValueChange={(value) => setNewModel(prev => ({ ...prev, provider: value }))}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="huggingface">Hugging Face</option>
                      <option value="ollama">Ollama</option>
                      <option value="llamacpp">llama.cpp</option>
                      <option value="textgen">Text Generation WebUI</option>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Model ID
                    </label>
                    <Input
                      value={newModel.model_id || ''}
                      onChange={(e) => setNewModel(prev => ({ ...prev, model_id: e.target.value }))}
                      placeholder="gpt-3.5-turbo, llama2, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      API Key (if required)
                    </label>
                    <Input
                      type="password"
                      value={newModel.api_key || ''}
                      onChange={(e) => setNewModel(prev => ({ ...prev, api_key: e.target.value }))}
                      placeholder="sk-..."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Base URL (for local models)
                    </label>
                    <Input
                      value={newModel.base_url || ''}
                      onChange={(e) => setNewModel(prev => ({ ...prev, base_url: e.target.value }))}
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Max Tokens
                    </label>
                    <Input
                      type="number"
                      value={newModel.max_tokens || 4096}
                      onChange={(e) => setNewModel(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Temperature
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={newModel.temperature || 0.9}
                      onChange={(e) => setNewModel(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    onClick={() => setShowAddModel(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addModel}
                    disabled={isLoading || !newModel.name || !newModel.provider || !newModel.model_id}
                  >
                    {isLoading ? 'Adding...' : 'Add Model'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}