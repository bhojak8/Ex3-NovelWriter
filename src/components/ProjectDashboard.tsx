import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Search, Filter, Grid, List, Clock, 
  TrendingUp, Star, Archive, Trash2, Download, Share2,
  Calendar, User, Tag, BarChart3, AlertCircle, Wifi, WifiOff,
  RefreshCw, ExternalLink, Shield, CheckCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useNovelWriter } from '../hooks/useNovelWriter';

import { apiService } from '../services/api';

interface ProjectDashboardProps {
  onCreateNew: () => void;
  onSelectProject: (project: any) => void;
}

export default function ProjectDashboard({ onCreateNew, onSelectProject }: ProjectDashboardProps) {
  const { loadProjects: getAllProjects, deleteProject, isLoading, isConnected, llmProvider, checkConnection } = useNovelWriter();
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('modified');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    loadProjectsData();
  }, []);

  const loadProjectsData = async () => {
    try {
      setLoadError(null);
      const allProjects = await getAllProjects();
      setProjects(allProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setLoadError(errorMessage);
      
      // Still try to load from local storage as fallback
      try {
        const localProjects = JSON.parse(localStorage.getItem('ex3-novel-projects') || '[]');
        setProjects(localProjects);
      } catch {
        setProjects([]);
      }
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      setLoadError(null);
      await checkConnection();
      await loadProjectsData();
    } catch (err) {
      console.error('Retry failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Connection retry failed';
      setLoadError(errorMessage);
    } finally {
      setIsRetrying(false);
    }
  };

  const openBackendURL = () => {
    const backendURL = apiService.getPrimaryBackendUrl();
    window.open(backendURL, '_blank');
  };


  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.genre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'progress': return b.progress - a.progress;
        case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      writing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const renderConnectionError = () => {
    if (!loadError) return null;

    const isSSLError = loadError.includes('SSL certificate needs to be accepted') || 
                       loadError.includes('certificate') || 
                       loadError.includes('SSL') || 
                       loadError.includes('TLS') ||
                       loadError.includes('ERR_CERT') ||
                       loadError.includes('ERR_SSL') ||
                       loadError.includes('ERR_TLS') ||
                       loadError.includes('CERTIFICATE_') ||
                       loadError.includes('SEC_ERROR_') ||
                       loadError.includes('SSL_ERROR_');
    const isTimeoutError = loadError.includes('timeout') || loadError.includes('Request timeout');
    const isNetworkError = loadError.includes('Network connection failed');
    const isConnectionError = loadError.includes('Backend connection failed') && !isSSLError && !isTimeoutError && !isNetworkError;

    return (
      <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-2">Backend Connection Issue</h3>
            
            {isSSLError && (
              <div className="space-y-4">
                <p className="text-sm text-red-700">
                  The backend server is using HTTPS with a self-signed SSL certificate. Your browser needs to accept this certificate to establish a secure connection.
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <h4 className="font-medium text-amber-800">SSL Certificate Setup Required</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-amber-700">
                      <strong>Quick Fix:</strong> Follow these steps to accept the SSL certificate:
                    </p>
                    
                    <ol className="text-sm text-amber-700 space-y-2 list-decimal list-inside ml-4">
                      <li>Click "Open Backend URL" below to open the backend in a new tab</li>
                      <li><strong>You'll see a security warning</strong> - this is normal for development servers</li>
                      <li><strong>Click "Advanced"</strong> or "Show details" on the warning page</li>
                      <li><strong>Click "Proceed to localhost (unsafe)"</strong> or "Accept the risk and continue"</li>
                      <li><strong>You should see a JSON response</strong> like &lbrace;"status": "healthy"&rbrace;</li>
                      <li><strong>Return to this tab</strong> and click "Retry Connection" below</li>
                    </ol>
                    
                    <div className="flex space-x-3 mt-4">
                      <Button 
                        onClick={openBackendURL}
                        variant="outline"
                        size="sm"
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        1. Open Backend URL
                      </Button>
                      
                      <Button 
                        onClick={handleRetryConnection}
                        disabled={isRetrying}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isRetrying ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        2. Retry Connection
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Why is this needed?</strong> The backend uses HTTPS for security but generates its own certificate. 
                    Browsers require manual approval for self-signed certificates to protect against malicious sites. 
                    This is a one-time setup step for development.
                  </p>
                </div>
              </div>
            )}

            {isTimeoutError && !isSSLError && (
              <div className="space-y-3">
                <p className="text-sm text-red-700">
                  The connection to the backend server timed out. The server may be overloaded or unreachable.
                </p>
                <Button 
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRetrying ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retry Connection
                </Button>
              </div>
            )}

            {isNetworkError && !isSSLError && !isTimeoutError && (
              <div className="space-y-3">
                <p className="text-sm text-red-700">
                  Network connection failed. The backend server may not be running.
                </p>
                <div className="text-sm text-red-600 bg-red-100 p-3 rounded">
                  <p className="font-medium mb-2">Troubleshooting steps:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check if the backend server is running</li>
                    <li>Verify the server is accessible at the expected port</li>
                    <li>Ensure no firewall is blocking the connection</li>
                    <li>Try restarting the backend server</li>
                  </ul>
                </div>
                <Button 
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRetrying ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retry Connection
                </Button>
              </div>
            )}

            {isConnectionError && !isSSLError && !isTimeoutError && !isNetworkError && (
              <div className="space-y-3">
                <p className="text-sm text-red-700">
                  Unable to connect to the backend server. Please check the following:
                </p>
                <div className="text-sm text-red-600 bg-red-100 p-3 rounded">
                  <p className="font-medium mb-2">Troubleshooting steps:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check if the backend server is running on the configured port</li>
                    <li>Verify the VITE_API_URL environment variable is correct</li>
                    <li>Ensure no firewall is blocking the connection</li>
                    <li>Try starting the backend server if it's not running</li>
                  </ul>
                </div>
                <Button 
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isRetrying ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retry Connection
                </Button>
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
              <strong>Technical Details:</strong> {loadError}
            </div>

            <p className="text-xs text-red-600 mt-3">
              Running in offline mode using local storage. Some features may be limited.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Novel Projects</h1>
            <p className="text-slate-600 mt-1">Manage and create your AI-powered novels</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Connection Status Indicator */}
            <div className="flex items-center space-x-2">
              {llmProvider === 'ex3-api' ? (
                isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span className="text-sm">Offline Mode</span>
                  </div>
                )
              ) : (
                <div className="flex items-center text-blue-600">
                  <Wifi className="h-4 w-4 mr-1" />
                  <span className="text-sm">Local LLM</span>
                </div>
              )}
            </div>
            <Button onClick={onCreateNew} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {renderConnectionError()}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="writing">Writing</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <option value="modified">Last Modified</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
              <option value="progress">Progress</option>
            </Select>
            
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Projects</p>
                <p className="text-2xl font-bold text-blue-900">{projects.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {projects.filter(p => p.status === 'writing').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Words</p>
                <p className="text-2xl font-bold text-purple-900">
                  {projects.reduce((total, p) => total + (p.wordCount || 0), 0).toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
            </h3>
            <p className="text-slate-600 mb-6">
              {projects.length === 0 
                ? 'Create your first AI-powered novel project'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {projects.length === 0 && (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  index={index}
                  onSelect={() => onSelectProject(project)}
                  onDelete={(e) => handleDeleteProject(project.id, e)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ 
  project, 
  viewMode, 
  index, 
  onSelect, 
  onDelete 
}: {
  project: any;
  viewMode: 'grid' | 'list';
  index: number;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      writing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={onSelect}
        className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-slate-900">{project.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-slate-600">{project.genre} • {project.chapters?.length || 0} chapters</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{Math.round(project.progress || 0)}%</p>
              <div className="w-20 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
            </div>
            
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 cursor-pointer transition-all hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm">
            <Share2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{project.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-2">{project.genre}</p>
        <p className="text-xs text-slate-500 line-clamp-2">{project.premise}</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Progress</span>
          <span className="font-medium">{Math.round(project.progress || 0)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${project.progress || 0}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
          />
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(project.modifiedAt || Date.now()).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{project.chapters?.length || 0} chapters</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}