import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { useNovelWriter } from '../hooks/useNovelWriter';

export default function ConnectionStatus() {
  const { 
    isConnected, 
    isLocalLLMConnected, 
    llmProvider, 
    checkConnection, 
    checkLocalLLMConnection 
  } = useNovelWriter();
  
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check connections on mount
    const checkConnections = async () => {
      try {
        await checkConnection();
      } catch (error) {
        // SSL certificate errors are expected on first load, don't log as errors
        if (error instanceof Error && !error.message.includes('SSL certificate')) {
          console.error('Connection check failed:', error);
        }
      }
      
      try {
        await checkLocalLLMConnection();
      } catch (error) {
        console.error('Local LLM connection check failed:', error);
      }
    };
    checkConnections();
  }, [checkConnection, checkLocalLLMConnection]);

  const handleRefreshConnection = async () => {
    setIsChecking(true);
    try {
      await checkConnection();
      await checkLocalLLMConnection();
    } finally {
      setIsChecking(false);
    }
  };

  const getConnectionStatus = () => {
    if (llmProvider === 'ex3-api') {
      return {
        connected: isConnected,
        label: 'Ex3 API',
        url: 'https://localhost:8000'
      };
    } else {
      return {
        connected: isLocalLLMConnected,
        label: 'Local LLM',
        url: 'http://localhost:11434'
      };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg border border-slate-200 p-3"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {status.connected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              status.connected ? 'text-green-700' : 'text-red-700'
            }`}>
              {status.label}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshConnection}
            disabled={isChecking}
            className="p-1"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="p-1"
          >
            <AlertCircle className="h-3 w-3" />
          </Button>
        </div>
        
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-slate-200"
            >
              <div className="text-xs text-slate-600 space-y-2">
                <div>
                  <strong>Status:</strong> {status.connected ? 'Connected' : 'Disconnected'}
                </div>
                <div>
                  <strong>URL:</strong> {status.url}
                </div>
                {!status.connected && llmProvider === 'ex3-api' && status.url.startsWith('https://') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                    <p className="text-yellow-800 text-xs">
                      <strong>SSL Certificate Issue?</strong><br/>
                      1. Visit <a href="https://localhost:8000/health" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">https://localhost:8000/health</a><br/>
                      2. Accept the security warning<br/>
                      3. Refresh this page
                    </p>
                  </div>
                )}
                {!status.connected && llmProvider === 'local-llm' && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                    <p className="text-blue-800 text-xs">
                      <strong>Local LLM Not Running?</strong><br/>
                      Start Ollama: <code>ollama serve</code>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}