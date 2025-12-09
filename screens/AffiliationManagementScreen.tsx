
import React, { useState } from 'react';
import { Character, Party, Affiliation, GeoJsonFeature, Demographics, StrongholdMap } from '../types';
import { aiSelectAffiliationCandidates, getIdeologyName } from '../utils/politics';
import IdeologyCompass from '../components/IdeologyCompass';

interface AffiliationManagementScreenProps {
  affiliation: Affiliation;
  allocatedSeats: { seatCode: string; party: Party; seatFeature: GeoJsonFeature }[];
  affiliationMembers: Character[];
  onConfirm: (partyId: string, selections: Map<string, string>) => void; // Map<seatCode, candidateId>
  onCancel: () => void;
  demographicsMap: Map<string, Demographics>;
  affiliationsMap: Map<string, Affiliation>;
  strongholdMap: StrongholdMap;
}

const AffiliationManagementScreen: React.FC<AffiliationManagementScreenProps> = ({
  affiliation,
  allocatedSeats,
  affiliationMembers,
  onConfirm,
  onCancel,
  demographicsMap,
  affiliationsMap,
  strongholdMap
}) => {
  const [selections, setSelections] = useState<Map<string, string>>(new Map());

  const handleSelect = (seatCode: string, candidateId: string) => {
    const newSelections = new Map(selections);
    newSelections.set(seatCode, candidateId);
    setSelections(newSelections);
  };

  const handleSubmit = () => {
    const partyId = allocatedSeats[0]?.party.id;
    if (partyId) {
      onConfirm(partyId, selections);
    }
  };
  
  const handleAutoSelect = () => {
    const autoSelections = aiSelectAffiliationCandidates(
      affiliationMembers,
      allocatedSeats,
      demographicsMap,
      affiliationsMap,
      strongholdMap
    );
    setSelections(autoSelections);
  };

  const usedMemberIds = new Set(selections.values());
  const isElectionMode = allocatedSeats.length > 0;

  const totalInfluence = affiliationMembers.reduce((acc, cur) => acc + cur.influence, 0);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 z-[5000] flex items-center justify-center font-sans p-4">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-3">
             <h2 className="text-3xl font-bold">
                {isElectionMode ? `Candidate Selection: ${affiliation.name}` : `Manage Faction: ${affiliation.name}`}
            </h2>
            <button onClick={onCancel} className="text-3xl hover:text-red-500">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
            
            {!isElectionMode && (
                <div className="mb-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Overview Stats */}
                        <div className="grid grid-cols-2 gap-4 content-start">
                            <div className="bg-gray-700 p-4 rounded-lg text-center">
                                <p className="text-gray-400 text-xs uppercase">Total Members</p>
                                <p className="text-2xl font-bold">{affiliationMembers.length}</p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg text-center">
                                <p className="text-gray-400 text-xs uppercase">Total Influence</p>
                                <p className="text-2xl font-bold text-blue-400">{totalInfluence.toLocaleString()}</p>
                            </div>
                             <div className="bg-gray-700 p-4 rounded-lg text-center col-span-2">
                                <p className="text-gray-400 text-xs uppercase">Ethnicity / Area</p>
                                <p className="text-xl font-bold text-green-400">{affiliation.ethnicity} • {affiliation.area}</p>
                            </div>
                        </div>

                        {/* Ideology */}
                        <div className="bg-gray-700/50 p-4 rounded-lg flex flex-col items-center">
                             <h3 className="text-lg font-semibold mb-2 text-gray-300">Faction Ideology</h3>
                             <IdeologyCompass 
                                mainIdeology={affiliation.ideology || { economic: 50, governance: 50 }}
                                mainLabel={affiliation.name}
                                size={180}
                             />
                             <p className="text-xs text-gray-400 mt-2 text-center">Average of all current members.</p>
                        </div>
                    </div>
                    
                    {/* Member Roster */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-300">Faction Member Roster</h3>
                        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                             <table className="w-full text-left text-sm">
                                <thead className="bg-gray-700 text-gray-300">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3 text-right">Influence</th>
                                        <th className="p-3 text-right">Ideology (E/G)</th>
                                        <th className="p-3 text-left">Ideology Name</th>
                                        <th className="p-3 text-center">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {affiliationMembers.sort((a,b) => b.influence - a.influence).map(member => (
                                        <tr key={member.id} className="hover:bg-gray-700/50">
                                            <td className="p-3 font-medium text-white">
                                                {member.name} 
                                                {member.isPlayer && <span className="ml-2 text-green-500 text-xs border border-green-500 px-1 rounded">YOU</span>}
                                            </td>
                                            <td className="p-3 text-right font-mono text-blue-300">{member.influence}</td>
                                            <td className="p-3 text-right font-mono text-gray-400">
                                                {Math.round(member.ideology.economic)}/{Math.round(member.ideology.governance)}
                                            </td>
                                            <td className="p-3 text-left text-gray-300 text-xs">
                                                {getIdeologyName(member.ideology)}
                                            </td>
                                            <td className="p-3 text-center">
                                                {member.isMP ? <span className="bg-blue-900 text-blue-200 text-xs px-2 py-0.5 rounded">MP</span> : 
                                                 member.isAffiliationLeader ? <span className="bg-yellow-900 text-yellow-200 text-xs px-2 py-0.5 rounded">Leader</span> : 
                                                 <span className="text-gray-500 text-xs">-</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {isElectionMode && (
                <div>
                    <p className="text-gray-400 mb-4">You have been allocated the following constituencies. Select a candidate from your affiliation for each seat.</p>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-700 sticky top-0">
                        <tr>
                            <th className="p-2">Constituency</th>
                            <th className="p-2">Party</th>
                            <th className="p-2">Select Candidate</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                        {allocatedSeats.map(({ seatCode, party, seatFeature }) => (
                            <tr key={seatCode} className="hover:bg-gray-700/50">
                            <td className="p-2 font-semibold">{seatFeature.properties.PARLIMEN}</td>
                            <td className="p-2" style={{ color: party.color }}>{party.name}</td>
                            <td className="p-2">
                                <select
                                value={selections.get(seatCode) || ''}
                                onChange={(e) => handleSelect(seatCode, e.target.value)}
                                className="bg-gray-600 text-white p-1 rounded-md w-full"
                                >
                                <option value="">-- Choose Candidate --</option>
                                {affiliationMembers.sort((a,b) => b.influence - a.influence).map(member => (
                                    <option 
                                    key={member.id} 
                                    value={member.id}
                                    disabled={usedMemberIds.has(member.id) && selections.get(seatCode) !== member.id}
                                    >
                                    {member.name} (Infl: {member.influence})
                                    </option>
                                ))}
                                </select>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-700">
          {isElectionMode ? (
            <>
                <button 
                    onClick={handleAutoSelect} 
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                >
                    Auto-Select
                </button>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 font-bold rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={allocatedSeats.some(s => !selections.get(s.seatCode))} className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed font-bold rounded-lg transition-colors">
                    Confirm Candidates
                    </button>
                </div>
            </>
          ) : (
              <div className="flex justify-end w-full">
                  <button onClick={onCancel} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition-colors">Close</button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AffiliationManagementScreen;