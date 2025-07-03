import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit3, Trash2, User, Heart, Briefcase, MapPin } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';

interface Character {
  id: string;
  name: string;
  age: number;
  occupation: string;
  personality: string;
  background: string;
  goals: string;
  relationships: string[];
  appearance: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
}

interface CharacterBuilderProps {
  characters: Character[];
  onUpdateCharacters: (characters: Character[]) => void;
}

export default function CharacterBuilder({ characters, onUpdateCharacters }: CharacterBuilderProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newCharacter, setNewCharacter] = useState<Partial<Character>>({
    name: '',
    age: 25,
    occupation: '',
    personality: '',
    background: '',
    goals: '',
    relationships: [],
    appearance: '',
    role: 'supporting'
  });

  const addCharacter = () => {
    if (newCharacter.name?.trim()) {
      const character: Character = {
        id: Date.now().toString(),
        name: newCharacter.name,
        age: newCharacter.age || 25,
        occupation: newCharacter.occupation || '',
        personality: newCharacter.personality || '',
        background: newCharacter.background || '',
        goals: newCharacter.goals || '',
        relationships: newCharacter.relationships || [],
        appearance: newCharacter.appearance || '',
        role: newCharacter.role || 'supporting'
      };
      
      onUpdateCharacters([...characters, character]);
      setNewCharacter({
        name: '',
        age: 25,
        occupation: '',
        personality: '',
        background: '',
        goals: '',
        relationships: [],
        appearance: '',
        role: 'supporting'
      });
    }
  };

  const updateCharacter = (updatedCharacter: Character) => {
    onUpdateCharacters(characters.map(c => 
      c.id === updatedCharacter.id ? updatedCharacter : c
    ));
    setSelectedCharacter(updatedCharacter);
    setIsEditing(false);
  };

  const deleteCharacter = (id: string) => {
    onUpdateCharacters(characters.filter(c => c.id !== id));
    if (selectedCharacter?.id === id) {
      setSelectedCharacter(null);
    }
  };

  const getRoleColor = (role: Character['role']) => {
    const colors = {
      protagonist: 'bg-blue-100 text-blue-800',
      antagonist: 'bg-red-100 text-red-800',
      supporting: 'bg-green-100 text-green-800',
      minor: 'bg-gray-100 text-gray-800'
    };
    return colors[role];
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">Character Builder</h3>
        </div>
        <Button onClick={() => setIsEditing(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Character List */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700">Characters ({characters.length})</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {characters.map((character) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCharacter?.id === character.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedCharacter(character)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-slate-900">{character.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(character.role)}`}>
                        {character.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{character.occupation}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{character.personality}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCharacter(character);
                        setIsEditing(true);
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCharacter(character.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {characters.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <User className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No characters yet. Create your first character!</p>
              </div>
            )}
          </div>
        </div>

        {/* Character Details/Editor */}
        <div>
          {isEditing ? (
            <CharacterEditor
              character={selectedCharacter}
              newCharacter={newCharacter}
              setNewCharacter={setNewCharacter}
              onSave={selectedCharacter ? updateCharacter : addCharacter}
              onCancel={() => setIsEditing(false)}
            />
          ) : selectedCharacter ? (
            <CharacterDetails character={selectedCharacter} />
          ) : (
            <div className="text-center py-12 text-slate-500">
              <User className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p>Select a character to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CharacterEditor({ 
  character, 
  newCharacter, 
  setNewCharacter, 
  onSave, 
  onCancel 
}: {
  character: Character | null;
  newCharacter: Partial<Character>;
  setNewCharacter: (char: Partial<Character>) => void;
  onSave: (char: Character) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Character>>(
    character || newCharacter
  );

  const handleSave = () => {
    if (formData.name?.trim()) {
      onSave({
        id: character?.id || Date.now().toString(),
        name: formData.name,
        age: formData.age || 25,
        occupation: formData.occupation || '',
        personality: formData.personality || '',
        background: formData.background || '',
        goals: formData.goals || '',
        relationships: formData.relationships || [],
        appearance: formData.appearance || '',
        role: formData.role || 'supporting'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-700">
          {character ? 'Edit Character' : 'New Character'}
        </h4>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Character name"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Age"
            value={formData.age || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Occupation"
            value={formData.occupation || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
          />
          <Select
            value={formData.role || 'supporting'}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as Character['role'] }))}
          >
            <option value="protagonist">Protagonist</option>
            <option value="antagonist">Antagonist</option>
            <option value="supporting">Supporting</option>
            <option value="minor">Minor</option>
          </Select>
        </div>

        <Textarea
          placeholder="Personality traits..."
          value={formData.personality || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
          rows={2}
        />

        <Textarea
          placeholder="Background and history..."
          value={formData.background || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
          rows={2}
        />

        <Textarea
          placeholder="Goals and motivations..."
          value={formData.goals || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
          rows={2}
        />

        <Textarea
          placeholder="Physical appearance..."
          value={formData.appearance || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, appearance: e.target.value }))}
          rows={2}
        />
      </div>
    </div>
  );
}

function CharacterDetails({ character }: { character: Character }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-700">Character Details</h4>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          character.role === 'protagonist' ? 'bg-blue-100 text-blue-800' :
          character.role === 'antagonist' ? 'bg-red-100 text-red-800' :
          character.role === 'supporting' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {character.role}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h5 className="font-medium text-slate-900 text-lg">{character.name}</h5>
          <p className="text-slate-600">{character.age} years old • {character.occupation}</p>
        </div>

        {character.personality && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-4 w-4 text-pink-600" />
              <span className="font-medium text-slate-700">Personality</span>
            </div>
            <p className="text-slate-600 text-sm">{character.personality}</p>
          </div>
        )}

        {character.background && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-slate-700">Background</span>
            </div>
            <p className="text-slate-600 text-sm">{character.background}</p>
          </div>
        )}

        {character.goals && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="font-medium text-slate-700">Goals</span>
            </div>
            <p className="text-slate-600 text-sm">{character.goals}</p>
          </div>
        )}

        {character.appearance && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-slate-700">Appearance</span>
            </div>
            <p className="text-slate-600 text-sm">{character.appearance}</p>
          </div>
        )}
      </div>
    </div>
  );
}