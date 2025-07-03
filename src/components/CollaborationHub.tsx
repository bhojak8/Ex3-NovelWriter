import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Share2, MessageCircle, Eye, Edit3, Clock, 
  UserPlus, Settings, Bell, CheckCircle, AlertCircle,
  Download, Upload, GitBranch, History, Lock, Unlock
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'reviewer' | 'viewer';
  avatar: string;
  lastActive: Date;
  isOnline: boolean;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
  position: { chapter: number; paragraph: number };
}

interface CollaborationHubProps {
  project: any;
  onUpdateProject: (project: any) => void;
}

export default function CollaborationHub({ project, onUpdateProject }: CollaborationHubProps) {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'comments' | 'versions' | 'sharing'>('collaborators');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      role: 'editor',
      avatar: '👩‍💻',
      lastActive: new Date(),
      isOnline: true
    },
    {
      id: '2',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'reviewer',
      avatar: '👨‍📚',
      lastActive: new Date(Date.now() - 3600000),
      isOnline: false
    }
  ]);
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: '1',
      content: 'This dialogue feels a bit stiff. Maybe we could make it more natural?',
      timestamp: new Date(),
      resolved: false,
      position: { chapter: 1, paragraph: 3 }
    },
    {
      id: '2',
      userId: '2',
      content: 'Great character development here! Really shows growth.',
      timestamp: new Date(Date.now() - 1800000),
      resolved: true,
      position: { chapter: 2, paragraph: 1 }
    }
  ]);

  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newComment, setNewComment] = useState('');
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowComments: true,
    allowDownload: false,
    requireApproval: true
  });

  const addCollaborator = () => {
    if (newCollaboratorEmail.trim()) {
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        name: newCollaboratorEmail.split('@')[0],
        email: newCollaboratorEmail,
        role: 'viewer',
        avatar: '👤',
        lastActive: new Date(),
        isOnline: false
      };
      setCollaborators([...collaborators, newCollaborator]);
      setNewCollaboratorEmail('');
    }
  };

  const updateCollaboratorRole = (id: string, role: Collaborator['role']) => {
    setCollaborators(collaborators.map(c => 
      c.id === id ? { ...c, role } : c
    ));
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        userId: '1', // Current user
        content: newComment,
        timestamp: new Date(),
        resolved: false,
        position: { chapter: 1, paragraph: 1 }
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const toggleCommentResolved = (id: string) => {
    setComments(comments.map(c => 
      c.id === id ? { ...c, resolved: !c.resolved } : c
    ));
  };

  const getRoleColor = (role: Collaborator['role']) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      editor: 'bg-blue-100 text-blue-800',
      reviewer: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role];
  };

  const tabs = [
    { id: 'collaborators', label: 'Team', icon: Users },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
    { id: 'versions', label: 'Versions', icon: GitBranch },
    { id: 'sharing', label: 'Sharing', icon: Share2 }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">Collaboration Hub</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {collaborators.filter(c => c.isOnline).map(c => (
              <div key={c.id} className="w-2 h-2 bg-green-500 rounded-full"></div>
            ))}
            <span className="text-sm text-slate-600">
              {collaborators.filter(c => c.isOnline).length} online
            </span>
          </div>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
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
              {tab.id === 'comments' && comments.filter(c => !c.resolved).length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {comments.filter(c => !c.resolved).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'collaborators' && (
        <div className="space-y-6">
          {/* Add Collaborator */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-3">Invite Collaborator</h4>
            <div className="flex space-x-3">
              <Input
                placeholder="Enter email address..."
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addCollaborator} disabled={!newCollaboratorEmail.trim()}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>

          {/* Collaborators List */}
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <motion.div
                key={collaborator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-lg">
                      {collaborator.avatar}
                    </div>
                    {collaborator.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-900">{collaborator.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(collaborator.role)}`}>
                        {collaborator.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{collaborator.email}</p>
                    <p className="text-xs text-slate-500">
                      {collaborator.isOnline ? 'Online now' : `Last seen ${collaborator.lastActive.toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={collaborator.role}
                    onChange={(e) => updateCollaboratorRole(collaborator.id, e.target.value as Collaborator['role'])}
                    className="text-sm border border-slate-300 rounded px-2 py-1"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCollaborator(collaborator.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-6">
          {/* Add Comment */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-3">Add Comment</h4>
            <div className="space-y-3">
              <Textarea
                placeholder="Write your comment or feedback..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button onClick={addComment} disabled={!newComment.trim()}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => {
              const collaborator = collaborators.find(c => c.id === comment.userId);
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg ${
                    comment.resolved ? 'border-green-200 bg-green-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm">
                        {collaborator?.avatar || '👤'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-slate-900">{collaborator?.name || 'Unknown'}</span>
                          <span className="text-xs text-slate-500">
                            Chapter {comment.position.chapter}, Paragraph {comment.position.paragraph}
                          </span>
                          <span className="text-xs text-slate-500">
                            {comment.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700">{comment.content}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCommentResolved(comment.id)}
                      className={comment.resolved ? 'text-green-600' : 'text-slate-600'}
                    >
                      {comment.resolved ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <History className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">Version History</h4>
            <p className="text-slate-600 mb-4">Track changes and restore previous versions</p>
            <Button variant="outline">
              <GitBranch className="h-4 w-4 mr-2" />
              View Version History
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'sharing' && (
        <div className="space-y-6">
          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-4">Sharing Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-700">Public Access</span>
                  <p className="text-sm text-slate-500">Anyone with the link can view</p>
                </div>
                <button
                  onClick={() => setShareSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    shareSettings.isPublic ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shareSettings.isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-700">Allow Comments</span>
                  <p className="text-sm text-slate-500">Viewers can leave feedback</p>
                </div>
                <button
                  onClick={() => setShareSettings(prev => ({ ...prev, allowComments: !prev.allowComments }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    shareSettings.allowComments ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shareSettings.allowComments ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-700">Allow Download</span>
                  <p className="text-sm text-slate-500">Viewers can download the novel</p>
                </div>
                <button
                  onClick={() => setShareSettings(prev => ({ ...prev, allowDownload: !prev.allowDownload }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    shareSettings.allowDownload ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shareSettings.allowDownload ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-3">
                <Input
                  value={`https://ex3-writer.com/share/${project.id}`}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}