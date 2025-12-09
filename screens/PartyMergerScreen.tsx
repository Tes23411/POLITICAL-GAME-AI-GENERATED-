
import React, { useState, useMemo } from 'react';
import { Party, Character, Affiliation, PartyMergerScreenProps } from '../types';

const PartyMergerScreen: React.FC<PartyMergerScreenProps> = ({ playerParty, parties, affiliations, characters, onPropose, onCancel, mode }) => {
  const [selectedPartyIds, setSelectedPartyIds] = useState<Set<string>>(new Set());
  const [selectedAffiliationIds, setSelectedAffiliationIds] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState('');

  const { mergeableParties, mergeableAffiliations } = useMemo(() => {
    // Filter Parties:
    let mParties = parties
      .filter(p => p.id !== playerParty.id && p.leaderId && characters.find(c => c.id === p.leaderId))
      .map(p => ({
        ...p,
        leader: characters.find(c => c.id === p.leaderId)!,
      }));

    // STRICT RULE: 
    // If Player is Single-Ethnic: Only allow merging with EXACT same ethnicity. 
    // (Cannot absorb Multi-Ethnic parties as that violates the single-ethnic constitution).
    // If Player is Multi-Ethnic: Can merge with anyone (result remains Multi-Ethnic).
    if (playerParty.ethnicityFocus) {
        mParties = mParties.filter(p => p.ethnicityFocus === playerParty.ethnicityFocus);
    }
    
    mParties.sort((a, b) => a.name.localeCompare(b.name));

    // Filter Affiliations:
    let mAffiliations = affiliations
      .filter(aff => !playerParty.affiliationIds.includes(aff.id))
      .map(aff => {
          const leader = characters.find(c => c.isAffiliationLeader && c.affiliationId === aff.id);
          const currentParty = parties.find(p => p.affiliationIds.includes(aff.id));
          return { ...aff, leader, currentParty };
      });

    // STRICT RULE for Affiliations:
    // If Player is Single-Ethnic: Only allow affiliations of that ethnicity.
    if (playerParty.ethnicityFocus) {
        mAffiliations = mAffiliations.filter(aff => aff.ethnicity === playerParty.ethnicityFocus);
    }
    mAffiliations.sort((a,b) => a.name.localeCompare(b.name));

    return { mergeableParties: mParties, mergeableAffiliations: mAffiliations };
  }, [parties, playerParty, affiliations, characters]);

  const handlePartySelect = (partyId: string) => {
    const newSelection = new Set(selectedPartyIds);
    if (newSelection.has(partyId)) {
      newSelection.delete(partyId);
    } else {
      newSelection.add(partyId);
    }
    setSelectedPartyIds(newSelection);
  };
  
  const handleAffiliationSelect = (affiliationId: string) => {
    const newSelection = new Set(selectedAffiliationIds);
    if (newSelection.has(affiliationId)) {
      newSelection.delete(affiliationId);
    } else {
      newSelection.add(affiliationId);
    }
    setSelectedAffiliationIds(newSelection);
  };

  useMemo(() => {
      if (mode === 'merge') {
          const selectedParties = mergeableParties.filter(p => selectedPartyIds.has(p.id));
          if (selectedParties.length > 0 || selectedAffiliationIds.size > 0) {
              const partyNames = [playerParty.name, ...selectedParties.map(p => p.name)].join(' & ');
              setNewName(`United ${partyNames} Front`);
          } else {
              setNewName('');
          }
      } else {
          setNewName(playerParty.name); // Fixed name for absorption
      }
  }, [selectedPartyIds, selectedAffiliationIds, playerParty.name, mergeableParties, mode]);

  const handlePropose = () => {
    const targetParties = parties.filter(p => selectedPartyIds.has(p.id));
    const targetAffiliations = affiliations.filter(aff => selectedAffiliationIds.has(aff.id));
    // Ensure newName is provided for merge, or just valid for absorb
    if(newName.trim()) {
        onPropose({ parties: targetParties, affiliations: targetAffiliations }, newName);
    }
  };
  
  const isProposalReady = (selectedPartyIds.size > 0 || selectedAffiliationIds.size > 0) && newName.trim();

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 z-[5000] flex items-center justify-center font-sans p-4">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-3">
            <h2 className="text-3xl font-bold">
                {mode === 'merge' ? "Negotiate Grand Merger" : "Invite Parties & Factions"}
            </h2>
            <button onClick={onCancel} className="text-3xl hover:text-red-500">&times;</button>
        </div>
        
        <div className="text-gray-400 text-sm mb-4">
            <p>
                {mode === 'merge' 
                    ? "Select parties and affiliations to combine into a brand new political entity." 
                    : "Select parties and affiliations to absorb into your existing party structure."}
            </p>
            <p className="text-xs mt-1 text-gray-500">
                {playerParty.ethnicityFocus 
                    ? `Restricted to ${playerParty.ethnicityFocus} entities only due to your party's constitution.` 
                    : "Open to all entities (Multi-Ethnic platform)."}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow overflow-y-auto pr-2">
            {/* Parties */}
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold mb-3">Parties</h3>
                <div className="bg-gray-900/50 p-3 rounded-lg overflow-y-auto space-y-2 flex-grow">
                    {mergeableParties.length > 0 ? mergeableParties.map(party => (
                        <div key={party.id} onClick={() => handlePartySelect(party.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${selectedPartyIds.has(party.id) ? 'border-blue-500 bg-blue-900/50' : 'border-transparent bg-gray-700 hover:bg-gray-600'}`}>
                            <p className="font-bold text-lg" style={{color: party.color}}>{party.name}</p>
                            <p className="text-xs text-gray-400">Leader: {party.leader.name}</p>
                            <p className="text-xs text-gray-500">{party.ethnicityFocus || 'Multi-Ethnic'}</p>
                        </div>
                    )) : <p className="text-sm text-gray-500 italic">No available parties found.</p>}
                </div>
            </div>
            
            {/* Affiliations */}
             <div className="flex flex-col lg:col-span-2">
                <h3 className="text-xl font-semibold mb-3">Affiliations</h3>
                <div className="bg-gray-900/50 p-3 rounded-lg overflow-y-auto space-y-2 flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mergeableAffiliations.length > 0 ? mergeableAffiliations.map(aff => (
                        <div key={aff.id} onClick={() => handleAffiliationSelect(aff.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${selectedAffiliationIds.has(aff.id) ? 'border-blue-500 bg-blue-900/50' : 'border-transparent bg-gray-700 hover:bg-gray-600'}`}>
                            <p className="font-bold text-md">{aff.name} <span className="text-[10px] text-gray-500 uppercase border border-gray-600 rounded px-1">{aff.ethnicity}</span></p>
                            <p className="text-xs text-gray-400">Leader: {aff.leader?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">Current: {aff.currentParty?.name || 'None'}</p>
                        </div>
                    )) : <p className="text-sm text-gray-500 italic col-span-2">No available affiliations found.</p>}
                </div>
            </div>
        </div>

        {/* Merger/Absorb Terms */}
        <div className="mt-4 pt-4 border-t border-gray-600">
            <h3 className="text-xl font-semibold mb-3">Terms of Agreement</h3>
            <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
                {mode === 'merge' ? (
                    <div>
                        <label htmlFor="partyName" className="block text-sm font-medium text-gray-300">New Party Name</label>
                        <input
                            id="partyName"
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="mt-1 w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                ) : (
                     <div>
                        <p className="block text-sm font-medium text-gray-300">Target Party</p>
                        <p className="text-lg font-bold mt-1" style={{color: playerParty.color}}>{playerParty.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Selected entities will be absorbed into your party structure.</p>
                    </div>
                )}
                
                <div>
                    <p className="block text-sm font-medium text-gray-300">Proposed Leadership</p>
                    <p className="text-gray-400 text-sm mt-1">You will lead the party. The most influential leader from the accepting groups will be offered the deputy position.</p>
                </div>
                <div className="mt-4 flex justify-end gap-4">
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 font-bold rounded-lg transition-colors">Cancel</button>
                    <button onClick={handlePropose} disabled={!isProposalReady} className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed font-bold rounded-lg transition-colors">
                        {mode === 'merge' ? "Propose Merger" : "Send Invitations"}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PartyMergerScreen;
