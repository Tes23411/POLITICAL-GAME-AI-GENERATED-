
import React, { useState, useMemo } from 'react';
import { Party, PoliticalAlliance, AllianceCreationScreenProps, AllianceType } from '../types';

const AllianceCreationScreen: React.FC<AllianceCreationScreenProps> = ({ playerParty, parties, alliances, onConfirm, onCancel }) => {
  const [selectedPartyIds, setSelectedPartyIds] = useState<Set<string>>(new Set());
  const [allianceName, setAllianceName] = useState('');
  const [allianceType, setAllianceType] = useState<AllianceType>('Pact');

  // Calculate likelihood
  const getLikelihood = (target: Party, type: AllianceType) => {
      const relation = playerParty.relations.get(target.id) || 50;
      let chance = relation / 100;
      if (type === 'Alliance') chance -= 0.2;
      else chance += 0.1;
      
      if (chance >= 0.7) return { text: 'High', color: 'text-green-400' };
      if (chance >= 0.4) return { text: 'Medium', color: 'text-yellow-400' };
      return { text: 'Low', color: 'text-red-400' };
  };

  // Filter parties that can be invited:
  // 1. Not the player's party
  // 2. Not already in an alliance
  const availableParties = useMemo(() => {
    return parties.filter(p => {
        if (p.id === playerParty.id) return false;
        const alreadyInAlliance = alliances.some(a => a.memberPartyIds.includes(p.id));
        return !alreadyInAlliance;
    });
  }, [parties, playerParty, alliances]);

  const handlePartyToggle = (partyId: string) => {
    const newSelection = new Set(selectedPartyIds);
    if (newSelection.has(partyId)) {
      newSelection.delete(partyId);
    } else {
      newSelection.add(partyId);
    }
    setSelectedPartyIds(newSelection);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (allianceName.trim() && selectedPartyIds.size > 0) {
          onConfirm(allianceName, Array.from(selectedPartyIds), allianceType);
      }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 z-[5000] flex items-center justify-center font-sans p-4">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <h2 className="text-3xl font-bold mb-2 text-center text-indigo-400">Form Political Coalition</h2>
        <p className="text-center text-gray-400 mb-6">Invite other parties to join forces.</p>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Coalition Name</label>
                    <input
                        type="text"
                        value={allianceName}
                        onChange={(e) => setAllianceName(e.target.value)}
                        placeholder="e.g., The National Front"
                        className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type of Agreement</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${allianceType === 'Pact' ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 bg-gray-700 hover:bg-gray-600'}`}
                            onClick={() => setAllianceType('Pact')}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-indigo-300">Electoral Pact</span>
                                {allianceType === 'Pact' && <span className="text-indigo-400">●</span>}
                            </div>
                            <p className="text-xs text-gray-400">
                                Parties agree NOT to field candidates in the same constituencies to avoid splitting votes. Easier to negotiate.
                            </p>
                        </div>

                        <div 
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${allianceType === 'Alliance' ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 bg-gray-700 hover:bg-gray-600'}`}
                            onClick={() => setAllianceType('Alliance')}
                        >
                             <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-indigo-300">Full Alliance</span>
                                {allianceType === 'Alliance' && <span className="text-indigo-400">●</span>}
                            </div>
                            <p className="text-xs text-gray-400">
                                Parties contest under a unified banner strategy. Harder to negotiate but maximizes combined vote efficiency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 mb-6 bg-gray-900/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Select Parties to Invite</h3>
                {availableParties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableParties.map(party => {
                             const likelihood = getLikelihood(party, allianceType);
                             return (
                                <div 
                                    key={party.id}
                                    onClick={() => handlePartyToggle(party.id)}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors flex justify-between items-center ${selectedPartyIds.has(party.id) ? 'border-indigo-500 bg-indigo-900/30' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <div>
                                        <p className="font-bold" style={{ color: party.color }}>{party.name}</p>
                                        <p className="text-xs text-gray-500">{party.ethnicityFocus || 'Multi-Ethnic'}</p>
                                    </div>
                                    <div className="text-right">
                                        {selectedPartyIds.has(party.id) ? (
                                            <span className="text-indigo-400 font-bold text-xl">✓</span>
                                        ) : (
                                            <span className={`text-xs font-bold ${likelihood.color}`}>{likelihood.text} Chance</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-center py-10">No available parties to invite.</p>
                )}
            </div>

            <div className="flex justify-end gap-4 mt-auto">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 font-bold rounded-lg transition-colors">
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={!allianceName.trim() || selectedPartyIds.size === 0}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed font-bold rounded-lg transition-colors"
                >
                    Propose {allianceType}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AllianceCreationScreen;
