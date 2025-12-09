
import React, { useState } from 'react';
import { Party, Character, Affiliation } from '../types';
import { getIdeologyName } from '../utils/politics';

interface EditorPanelProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  setNextElectionDate: (date: Date) => void;
  parties: Party[];
  setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  affiliationsMap: Map<string, Affiliation>;
  onClose: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  currentDate,
  setCurrentDate,
  setNextElectionDate,
  parties,
  setParties,
  characters,
  setCharacters,
  affiliationsMap,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'parties' | 'characters'>('general');
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [charSearch, setCharSearch] = useState('');

  const handleSkipTime = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const handleForceElection = () => {
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNextElectionDate(tomorrow);
    alert("General Election scheduled for tomorrow!");
  };

  const updateParty = (partyId: string, updates: Partial<Party>) => {
    setParties(prev => prev.map(p => p.id === partyId ? { ...p, ...updates } : p));
  };

  const updateCharacter = (charId: string, updates: Partial<Character>) => {
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, ...updates } : c));
  };

  const selectedParty = parties.find(p => p.id === selectedPartyId);
  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(charSearch.toLowerCase())
  ).slice(0, 50); // Limit results for performance
  
  const selectedCharacter = characters.find(c => c.id === selectedCharId);

  return (
    <div className="absolute inset-0 bg-black/80 z-[9000] flex items-center justify-center font-sans p-4 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl border-2 border-purple-500/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              World Editor
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-900 border-b border-gray-700">
          {['general', 'parties', 'characters'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-bold uppercase text-sm tracking-wider transition-colors ${
                activeTab === tab 
                  ? 'bg-purple-900/30 text-purple-400 border-b-2 border-purple-500' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden flex">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="p-8 w-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">Time Control</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <button onClick={() => handleSkipTime(30)} className="flex-1 bg-blue-700 hover:bg-blue-600 py-2 rounded font-bold">Skip 1 Month</button>
                      <button onClick={() => handleSkipTime(365)} className="flex-1 bg-blue-700 hover:bg-blue-600 py-2 rounded font-bold">Skip 1 Year</button>
                    </div>
                     <div className="flex gap-4">
                      <button onClick={() => handleSkipTime(365 * 4)} className="flex-1 bg-blue-800 hover:bg-blue-700 py-2 rounded font-bold">Skip 4 Years</button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">Political Events</h3>
                  <button 
                    onClick={handleForceElection} 
                    className="w-full bg-red-700 hover:bg-red-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-red-900/20 border border-red-500"
                  >
                    Force General Election (Tomorrow)
                  </button>
                  <p className="text-xs text-gray-400 mt-2">Disregards constitutional terms.</p>
                </div>
              </div>
            </div>
          )}

          {/* Parties Tab */}
          {activeTab === 'parties' && (
            <div className="flex w-full h-full">
              {/* Sidebar List */}
              <div className="w-1/3 border-r border-gray-700 overflow-y-auto bg-gray-800/50">
                {parties.map(party => (
                  <div 
                    key={party.id}
                    onClick={() => setSelectedPartyId(party.id)}
                    className={`p-4 cursor-pointer border-b border-gray-700 hover:bg-gray-700 transition-colors ${selectedPartyId === party.id ? 'bg-purple-900/30 border-l-4 border-l-purple-500' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{backgroundColor: party.color}}></div>
                      <span className="font-bold text-gray-200">{party.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Area */}
              <div className="w-2/3 p-6 overflow-y-auto bg-gray-900">
                {selectedParty ? (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2" style={{color: selectedParty.color}}>Edit {selectedParty.name}</h3>
                    
                    <div>
                      <label className="block text-gray-400 text-sm font-bold mb-2">Party Name</label>
                      <input 
                        type="text" 
                        value={selectedParty.name}
                        onChange={(e) => updateParty(selectedParty.id, { name: e.target.value })}
                        className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-bold mb-2">Color</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={selectedParty.color}
                          onChange={(e) => updateParty(selectedParty.id, { color: e.target.value })}
                          className="h-10 w-20 bg-transparent border-0 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={selectedParty.color}
                          onChange={(e) => updateParty(selectedParty.id, { color: e.target.value })}
                          className="flex-grow bg-gray-800 text-white p-2 rounded border border-gray-600 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-bold mb-2">Unity ({Math.round(selectedParty.unity)}%)</label>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={selectedParty.unity}
                        onChange={(e) => updateParty(selectedParty.id, { unity: parseInt(e.target.value) })}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    <div className="bg-gray-800 p-4 rounded border border-gray-700">
                      <h4 className="font-bold text-gray-300 mb-4">Ideology</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Economic (Planned ↔ Market)</span>
                            <span className="text-blue-400">{Math.round(selectedParty.ideology.economic)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={selectedParty.ideology.economic}
                            onChange={(e) => updateParty(selectedParty.id, { ideology: { ...selectedParty.ideology, economic: parseInt(e.target.value) } })}
                            className="w-full accent-blue-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Governance (Decentralized ↔ Centralized)</span>
                            <span className="text-green-400">{Math.round(selectedParty.ideology.governance)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={selectedParty.ideology.governance}
                            onChange={(e) => updateParty(selectedParty.id, { ideology: { ...selectedParty.ideology, governance: parseInt(e.target.value) } })}
                            className="w-full accent-green-500"
                          />
                        </div>
                        <div className="text-center pt-2">
                           <span className="inline-block px-3 py-1 bg-gray-700 rounded text-sm text-gray-300">
                             {getIdeologyName(selectedParty.ideology)}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center mt-20">Select a party to edit.</p>
                )}
              </div>
            </div>
          )}

          {/* Characters Tab */}
          {activeTab === 'characters' && (
             <div className="flex w-full h-full">
              {/* Sidebar List */}
              <div className="w-1/3 border-r border-gray-700 flex flex-col bg-gray-800/50">
                <div className="p-4 border-b border-gray-700">
                  <input 
                    type="text" 
                    placeholder="Search characters..." 
                    value={charSearch}
                    onChange={(e) => setCharSearch(e.target.value)}
                    className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="overflow-y-auto flex-grow">
                  {filteredCharacters.map(char => (
                    <div 
                      key={char.id}
                      onClick={() => setSelectedCharId(char.id)}
                      className={`p-3 cursor-pointer border-b border-gray-700 hover:bg-gray-700 transition-colors flex justify-between items-center ${selectedCharId === char.id ? 'bg-purple-900/30 border-l-4 border-l-purple-500' : ''}`}
                    >
                      <span className={`font-medium ${!char.isAlive ? 'text-red-500 line-through' : 'text-gray-200'}`}>{char.name}</span>
                      {char.isPlayer && <span className="text-xs bg-green-900 text-green-300 px-1 rounded">YOU</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Area */}
              <div className="w-2/3 p-6 overflow-y-auto bg-gray-900">
                {selectedCharacter ? (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2 flex items-center justify-between">
                      <span>Edit Character</span>
                      {selectedCharacter.isPlayer && <span className="text-sm bg-green-700 px-2 py-1 rounded text-white">Player</span>}
                    </h3>

                    <div>
                      <label className="block text-gray-400 text-sm font-bold mb-2">Name</label>
                      <input 
                        type="text" 
                        value={selectedCharacter.name}
                        onChange={(e) => updateCharacter(selectedCharacter.id, { name: e.target.value })}
                        className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-4 rounded border border-gray-700">
                         <h4 className="font-bold text-gray-400 mb-3 text-sm uppercase">Status</h4>
                         <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={selectedCharacter.isAlive} 
                                onChange={(e) => updateCharacter(selectedCharacter.id, { isAlive: e.target.checked })}
                                className="w-5 h-5 accent-green-500"
                              />
                              <span className={selectedCharacter.isAlive ? 'text-green-400' : 'text-gray-500'}>Alive</span>
                            </label>
                         </div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded border border-gray-700">
                         <h4 className="font-bold text-gray-400 mb-3 text-sm uppercase">Allegiance</h4>
                         <select 
                            value={selectedCharacter.affiliationId}
                            onChange={(e) => updateCharacter(selectedCharacter.id, { affiliationId: e.target.value })}
                            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 text-sm"
                         >
                           {Array.from(affiliationsMap.values()).map(aff => (
                             <option key={aff.id} value={aff.id}>{aff.name}</option>
                           ))}
                         </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div>
                          <label className="flex justify-between text-gray-400 text-sm font-bold mb-1">
                            <span>Influence</span>
                            <span className="text-white">{Math.round(selectedCharacter.influence)}</span>
                          </label>
                          <input 
                            type="range" min="0" max="100" 
                            value={selectedCharacter.influence}
                            onChange={(e) => updateCharacter(selectedCharacter.id, { influence: parseInt(e.target.value) })}
                            className="w-full accent-blue-500"
                          />
                       </div>
                       <div>
                          <label className="flex justify-between text-gray-400 text-sm font-bold mb-1">
                            <span>Charisma</span>
                            <span className="text-white">{Math.round(selectedCharacter.charisma)}</span>
                          </label>
                          <input 
                            type="range" min="0" max="100" 
                            value={selectedCharacter.charisma}
                            onChange={(e) => updateCharacter(selectedCharacter.id, { charisma: parseInt(e.target.value) })}
                            className="w-full accent-purple-500"
                          />
                       </div>
                       <div>
                          <label className="flex justify-between text-gray-400 text-sm font-bold mb-1">
                            <span>Recognition</span>
                            <span className="text-white">{Math.round(selectedCharacter.recognition)}</span>
                          </label>
                          <input 
                            type="range" min="0" max="100" 
                            value={selectedCharacter.recognition}
                            onChange={(e) => updateCharacter(selectedCharacter.id, { recognition: parseInt(e.target.value) })}
                            className="w-full accent-teal-500"
                          />
                       </div>
                    </div>

                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center mt-20">Select a character to edit.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
