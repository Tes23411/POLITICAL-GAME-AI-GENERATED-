
import React, { useState, useMemo, useEffect } from 'react';
import { Character, Party, Affiliation } from '../types';
import { generateCharacterName } from '../utils/naming';

interface CharacterSelectionScreenProps {
  onCharacterSelect: (character: Omit<Character, 'currentSeatCode' | 'dateOfBirth' | 'isAlive' | 'ideology'>) => void;
  uniqueStates: string[];
  party: Party;
  affiliationsMap: Map<string, Affiliation>;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({ onCharacterSelect, uniqueStates, party, affiliationsMap }) => {
  
  const availableAffiliations = useMemo(() => {
    return party.affiliationIds.map(id => affiliationsMap.get(id)).filter(Boolean) as Affiliation[];
  }, [party, affiliationsMap]);

  const [customName, setCustomName] = useState('');
  const [selectedAffiliationId, setSelectedAffiliationId] = useState<string>('');

  useEffect(() => {
    if (availableAffiliations.length > 0 && (!selectedAffiliationId || !availableAffiliations.find(a => a.id === selectedAffiliationId))) {
        setSelectedAffiliationId(availableAffiliations[0].id);
    }
  }, [availableAffiliations, selectedAffiliationId]);
  
  const preGeneratedCharacters: Omit<Character, 'currentSeatCode' | 'isPlayer' | 'dateOfBirth' | 'isAlive' | 'ideology'>[] = useMemo(() => {
    if (availableAffiliations.length === 0) return [];
    
    return Array.from({ length: 3 }, (_, i) => {
      const affiliation = randomElement(availableAffiliations);
      const ethnicity = affiliation.ethnicity;
      
      return {
        id: `pregen-${i}`,
        name: generateCharacterName(ethnicity),
        affiliationId: affiliation.id,
        ethnicity,
        state: uniqueStates[Math.floor(Math.random() * uniqueStates.length)],
        charisma: Math.floor(Math.random() * 70) + 30,
        influence: Math.floor(Math.random() * 70) + 30,
        recognition: Math.floor(Math.random() * 70) + 30,
        isMP: false,
        history: [],
      };
    });
  }, [availableAffiliations, uniqueStates]);
  
  const handleSelectPreGenerated = (character: Omit<Character, 'currentSeatCode' | 'isPlayer' | 'dateOfBirth' | 'isAlive' | 'ideology'>) => {
    onCharacterSelect({
      ...character,
      id: `player-${Date.now()}`,
      isPlayer: true,
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim() && selectedAffiliationId) {
      const affiliation = affiliationsMap.get(selectedAffiliationId)!;
      const ethnicity = affiliation.ethnicity;
      
      onCharacterSelect({
        id: `player-${Date.now()}`,
        name: customName.trim(),
        ethnicity,
        affiliationId: selectedAffiliationId,
        state: uniqueStates[Math.floor(Math.random() * uniqueStates.length)],
        isPlayer: true,
        charisma: Math.floor(Math.random() * 50) + 25,
        influence: Math.floor(Math.random() * 50) + 25,
        recognition: Math.floor(Math.random() * 50) + 25,
        isMP: false,
        history: [],
      });
    }
  };

  const selectedAffiliation = affiliationsMap.get(selectedAffiliationId);

  if (availableAffiliations.length === 0) {
      return (
          <div className="absolute inset-0 z-[5000] flex flex-col items-center justify-center bg-gray-900 text-white p-4">
              <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-lg text-center border border-red-500">
                  <h2 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h2>
                  <p className="text-gray-300 mb-6">
                      The party <span className="font-bold text-white">{party.name}</span> has no valid political factions configured. 
                      Character creation cannot proceed.
                  </p>
                  <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold">
                      Restart Game
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="absolute inset-0 z-[5000] flex flex-col items-center justify-center bg-gray-900 text-white font-sans p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="text-center mb-6">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Select Your Character</h1>
            <p className="text-lg" style={{ color: party.color, textShadow: '0 0 2px black' }}>
                Joining <span className="font-bold">{party.name}</span>
            </p>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 pb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-300 border-b border-gray-700 pb-2">Quick Start</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {preGeneratedCharacters.map(char => (
                <div 
                key={char.id}
                onClick={() => handleSelectPreGenerated(char)}
                className="bg-gray-800 p-5 rounded-lg text-left cursor-pointer hover:bg-gray-700 transition-all duration-200 border border-gray-700 hover:border-blue-500 shadow-md group relative overflow-hidden"
                >
                <div className="absolute top-0 left-0 w-1 h-full bg-gray-600 group-hover:bg-blue-500 transition-colors"></div>
                <p className="text-xl font-bold mb-2 text-center group-hover:text-blue-400">{char.name}</p>
                <div className="text-sm text-gray-300 space-y-1">
                    <p className="flex justify-between"><span className="text-gray-500">Faction:</span> <span>{affiliationsMap.get(char.affiliationId)?.name}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Origin:</span> <span>{char.state}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Ethnicity:</span> <span>{char.ethnicity}</span></p>
                    <div className="mt-3 pt-2 border-t border-gray-700 grid grid-cols-3 gap-1 text-center text-xs">
                        <div>
                            <span className="block text-gray-500 uppercase tracking-wider">Inf</span>
                            <span className="font-bold text-blue-300 text-lg">{char.influence}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 uppercase tracking-wider">Cha</span>
                            <span className="font-bold text-purple-300 text-lg">{char.charisma}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 uppercase tracking-wider">Rec</span>
                            <span className="font-bold text-teal-300 text-lg">{char.recognition}</span>
                        </div>
                    </div>
                </div>
                </div>
            ))}
            </div>

            <h2 className="text-xl font-semibold mb-4 text-gray-300 border-b border-gray-700 pb-2">Create Custom Character</h2>
            <form onSubmit={handleCustomSubmit} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Character Name</label>
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Enter full name"
                            className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 placeholder-gray-600"
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-bold text-gray-400 mb-2">Faction & Background</label>
                         <select
                            value={selectedAffiliationId}
                            onChange={(e) => setSelectedAffiliationId(e.target.value)}
                            className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
                         >
                             {availableAffiliations.map(aff => (
                                 <option key={aff.id} value={aff.id}>
                                     {aff.name} ({aff.ethnicity}, {aff.area})
                                 </option>
                             ))}
                         </select>
                    </div>
                </div>
                
                {selectedAffiliation && (
                    <div className="bg-gray-900 p-4 rounded-lg mb-6 flex flex-wrap gap-4 text-sm text-gray-300 border border-gray-700">
                         <div className="px-3 py-1 bg-gray-800 rounded border border-gray-600">
                             <span className="text-gray-500 uppercase text-[10px] mr-2 tracking-wider">Ethnicity</span>
                             <span className="font-bold text-white">{selectedAffiliation.ethnicity}</span>
                         </div>
                         <div className="px-3 py-1 bg-gray-800 rounded border border-gray-600">
                             <span className="text-gray-500 uppercase text-[10px] mr-2 tracking-wider">Base</span>
                             <span className="font-bold text-white">{selectedAffiliation.area}</span>
                         </div>
                         {selectedAffiliation.baseIdeology && (
                             <div className="px-3 py-1 bg-gray-800 rounded border border-gray-600 flex items-center">
                                <span className="text-gray-500 uppercase text-[10px] mr-2 tracking-wider">Ideology</span>
                                <span className="font-bold text-blue-300">Eco {selectedAffiliation.baseIdeology.economic}</span>
                                <span className="text-gray-600 mx-2">|</span>
                                <span className="font-bold text-purple-300">Gov {selectedAffiliation.baseIdeology.governance}</span>
                             </div>
                         )}
                    </div>
                )}

                <div className="flex justify-end">
                    <button 
                        type="submit"
                        disabled={!customName.trim() || !selectedAffiliationId}
                        className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-green-900/30 transform hover:scale-105 active:scale-95"
                    >
                        Confirm & Start Game
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectionScreen;
