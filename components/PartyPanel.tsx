
import React, { useMemo } from 'react';
import { GeoJsonFeature, Demographics, Character, Affiliation, Party, StrongholdMap } from '../types';
import { calculateEffectiveInfluence } from '../utils/influence';
import IdeologyCompass from './IdeologyCompass';

interface PartyPanelProps {
  party: Party;
  members: Character[];
  affiliationsMap: Map<string, Affiliation>;
  featuresMap: Map<string, GeoJsonFeature>;
  demographicsMap: Map<string, Demographics>;
  onClose: () => void;
  onCharacterClick: (character: Character) => void;
  strongholdMap: StrongholdMap;
}

const PartyPanel: React.FC<PartyPanelProps> = ({ party, members, affiliationsMap, featuresMap, demographicsMap, onClose, onCharacterClick, strongholdMap }) => {
  
  const livingMembers = useMemo(() => members.filter(m => m.isAlive), [members]);

  const sortedMembers = useMemo(() => {
    return livingMembers.map(member => {
      const seat = featuresMap.get(member.currentSeatCode);
      const demographics = demographicsMap.get(member.currentSeatCode);
      const contestData = party.contestedSeats.get(member.currentSeatCode);
      const effectiveInfluence = seat ? calculateEffectiveInfluence(member, seat, demographics || null, affiliationsMap, strongholdMap, contestData?.candidateId, contestData?.allocatedAffiliationId) : member.influence;
      return { ...member, effectiveInfluence };
    }).sort((a, b) => b.effectiveInfluence - a.effectiveInfluence);
  }, [livingMembers, featuresMap, demographicsMap, affiliationsMap, party.contestedSeats, strongholdMap]);
  
  const totalInfluence = useMemo(() => 
    sortedMembers.reduce((sum, member) => sum + member.effectiveInfluence, 0),
    [sortedMembers]
  );
  
  const leader = useMemo(() => party.leaderId ? livingMembers.find(m => m.id === party.leaderId) : null, [party.leaderId, livingMembers]);
  const deputyLeader = useMemo(() => party.deputyLeaderId ? livingMembers.find(m => m.id === party.deputyLeaderId) : null, [party.deputyLeaderId, livingMembers]);

  return (
    <div className="absolute top-20 right-4 h-[calc(100%-5.5rem)] w-[450px] bg-gray-800 bg-opacity-95 text-white p-4 shadow-lg z-[1500] overflow-y-auto font-sans rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: party.color }}>{party.name}</h2>
        <button onClick={onClose} className="text-2xl hover:text-red-500">&times;</button>
      </div>
      
      <div className="mb-6 flex justify-center">
         <IdeologyCompass 
             mainIdeology={party.ideology} 
             mainLabel={party.name}
             size={180} 
         />
      </div>

      <div className="mb-4 p-2 bg-gray-700 rounded text-sm">
        <p><span className="font-semibold">Total Members:</span> {sortedMembers.length}</p>
        <p><span className="font-semibold">Total Effective Influence:</span> {totalInfluence.toLocaleString()}</p>
      </div>

      {leader && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-1">National Leader</h3>
          <div className="text-sm bg-gray-700 p-2 rounded flex justify-between items-center cursor-pointer hover:bg-gray-600" onClick={() => onCharacterClick(leader)}>
            <p className="font-bold">{leader.name}</p>
            <p className="text-xs text-gray-400">Seat: {featuresMap.get(leader.currentSeatCode)?.properties.PARLIMEN || 'N/A'}</p>
          </div>
        </div>
      )}
      
      {deputyLeader && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-1">Deputy Leader</h3>
          <div className="text-sm bg-gray-700 p-2 rounded flex justify-between items-center cursor-pointer hover:bg-gray-600" onClick={() => onCharacterClick(deputyLeader)}>
            <p className="font-bold">{deputyLeader.name}</p>
            <p className="text-xs text-gray-400">Seat: {featuresMap.get(deputyLeader.currentSeatCode)?.properties.PARLIMEN || 'N/A'}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-1">State Leadership</h3>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
          {party.stateBranches.map(branch => {
            const stateLeader = branch.leaderId ? livingMembers.find(m => m.id === branch.leaderId) : null;
            const executives = branch.executiveIds.map(id => livingMembers.find(m => m.id === id)).filter(Boolean) as Character[];

            if (!stateLeader) return null; // Don't show empty branches

            return (
              <div key={branch.state} className="bg-gray-900/50 p-3 rounded">
                <h4 className="font-bold text-md text-amber-300">{branch.state}</h4>
                <div className="mt-2 pl-2 border-l-2 border-amber-300/50 space-y-1">
                  <div onClick={() => stateLeader && onCharacterClick(stateLeader)} className="cursor-pointer p-1 hover:bg-gray-700/50 rounded">
                    <p className="text-sm font-semibold">{stateLeader.name}</p>
                    <p className="text-xs text-gray-400">State Leader</p>
                  </div>
                  {executives.length > 0 && <p className="text-xs text-gray-500 pt-1">Executives:</p>}
                  {executives.map(exec => (
                    <div key={exec.id} onClick={() => onCharacterClick(exec)} className="cursor-pointer pl-2 p-1 hover:bg-gray-700/50 rounded">
                      <p className="text-xs">{exec.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
       <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 border-b border-gray-600 pb-1">Leader History</h3>
        <div className="max-h-40 overflow-y-auto pr-2 text-sm space-y-2">
            {[...party.leaderHistory].reverse().map((entry, index) => (
                <div key={`${entry.leaderId}-${index}`} className="bg-gray-700/50 p-2 rounded">
                    <p className="font-semibold">{entry.name}</p>
                    <p className="text-xs text-gray-400">
                        {entry.startDate.getFullYear()} - {entry.endDate ? entry.endDate.getFullYear() : 'Present'}
                    </p>
                </div>
            ))}
        </div>
    </div>
    </div>
  );
};

export default PartyPanel;
