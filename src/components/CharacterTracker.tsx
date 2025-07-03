import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit3, Trash2, MapPin } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';

interface Character {
  id: string;
  name: string;
  description: string;
  relationships: string[];
  appearances: number[];
}

interface Location {
  id: string;
  name: string;
  description: string;
  chapters: number[];
}

interface CharacterTrackerProps {
  characters: Character[];
  locations: Location[];
  onUpdateCharacters: (characters: Character[]) => void;
  onUpdateLocations: (locations: Location[]) => void;
}

export default function CharacterTracker({
  characters,
  locations,
  onUpdateCharacters,
  onUpdateLocations
}: CharacterTrackerProps) {
  const [activeTab, setActiveTab] = useState<'characters' | 'locations'>('characters');
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '' });
  const [newLocation, setNewLocation] = useState({ name: '', description: '' });

  const addCharacter = () => {
    if (newCharacter.name.trim()) {
      const character: Character = {
        id: Date.now().toString(),
        name: newCharacter.name,
        description: newCharacter.description,
        relationships: [],
        appearances: []
      };
      onUpdateCharacters([...characters, character]);
      setNewCharacter({ name: '', description: '' });
    }
  };

  const addLocation = () => {
    if (newLocation.name.trim()) {
      const location: Location = {
        id: Date.now().toString(),
        name: newLocation.name,
        description: newLocation.description,
        chapters: []
      };
      onUpdateLocations([...locations, location]);
      setNewLocation({ name: '', description: '' });
    }
  };

  const deleteCharacter = (id: string) => {
    onUpdateCharacters(characters.filter(c => c.id !== id));
  };

  const deleteLocation = (id: string) => {
    onUpdateLocations(locations.filter(l => l.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-900">Story Elements</h3>
        
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'characters'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4 inline mr-1" />
            Characters
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'locations'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="h-4 w-4 inline mr-1" />
            Locations
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'characters' ? (
          <motion.div
            key="characters"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Add New Character */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input
                  placeholder="Character name"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                />
                <Button onClick={addCharacter} disabled={!newCharacter.name.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Character
                </Button>
              </div>
              <Textarea
                placeholder="Character description, background, traits..."
                value={newCharacter.description}
                onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Character List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {characters.map((character) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{character.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{character.description}</p>
                      {character.appearances.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">
                          Appears in chapters: {character.appearances.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCharacter(character.id)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCharacter(character.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="locations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Add New Location */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input
                  placeholder="Location name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                />
                <Button onClick={addLocation} disabled={!newLocation.name.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
              <Textarea
                placeholder="Location description, atmosphere, significance..."
                value={newLocation.description}
                onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Location List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {locations.map((location) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{location.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{location.description}</p>
                      {location.chapters.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">
                          Featured in chapters: {location.chapters.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLocation(location.id)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLocation(location.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}