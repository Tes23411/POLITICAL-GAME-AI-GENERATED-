
import React, { useMemo, useState } from 'react';
import { GeoJsonFeature, Demographics, Character, Affiliation, Party, ElectionHistoryEntry, PoliticalAlliance, StrongholdMap } from '../types';
import { calculateEffectiveInfluence } from '../utils/influence';

interface ConstituencyPanelProps {
  seat: GeoJsonFeature;
  demographics: Demographics | null;
  characters: Character[];
  affiliationsMap: Map<string, Affiliation>;
  partiesMap: Map<string, Party>;
  onClose: () => void;
  onCharacterClick: (character: Character) => void;
  affiliationToPartyMap: Map<string, string>;
  onPartyClick: (partyId: string) => void;
  electionHistory: ElectionHistoryEntry[];
  strongholdMap: StrongholdMap;
}

const ProgressBar: React.FC<{ value: number; color: string; }> = ({ value, color }) => (
    <div className="w-full bg-gray-700 rounded-full h-3">
      <div
        className="h-3 rounded-full"
        style={{ width: `${value}%`, backgroundColor: color, transition: 'width 0.3s ease-out' }}
      ></div>
    </div>
  );

export const ConstituencyPanel: React.FC<ConstituencyPanelProps> = ({ seat, demographics, characters, affiliationsMap, partiesMap, onClose, onCharacterClick, affiliationToPartyMap, onPartyClick, electionHistory, strongholdMap }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'history'>('overview');
  
  const seatCode = seat.properties.UNIQUECODE;
  const livingCharactersInSeat = useMemo(() => characters.filter(c => c.isAlive && c.currentSeatCode === seatCode), [characters, seatCode]);
  
  const stronghold = useMemo(() => strongholdMap.get(seatCode), [strongholdMap, seatCode]);
  const strongholdAffiliation = stronghold ? affiliationsMap.get(stronghold.affiliationId) : null;

  const { sortedParties, totalEffectiveInfluenceInSeat } = useMemo(() => {
    const partyInfluenceMap = new Map<string, { totalEffectiveInfluence: number; count: number }>();
    let totalInfluence = 0;
    
    livingCharactersInSeat.forEach(char => {
      const partyId = affiliationToPartyMap.get(char.affiliationId);
      if (!partyId) return;

      const party = partiesMap.get(partyId);
      if (!party) return;
      const contestData = party.contestedSeats ? party.contestedSeats.get(seatCode) : undefined;
      const effectiveInfluence = calculateEffectiveInfluence(char, seat, demographics, affiliationsMap, strongholdMap, contestData?.candidateId, contestData?.allocatedAffiliationId);
      
      const current = partyInfluenceMap.get(partyId) || { totalEffectiveInfluence: 0, count: 0 };
      partyInfluenceMap.set(partyId, {
        totalEffectiveInfluence: current.totalEffectiveInfluence + effectiveInfluence,
        count: current.count + 1,
      });
      totalInfluence += effectiveInfluence;
    });

    const sorted = Array.from(partyInfluenceMap.entries())
      .map(([id, data]) => ({
        id,
        ...data,
        percentage: totalInfluence > 0 ? (data.totalEffectiveInfluence / totalInfluence) * 100 : 0,
      }))
      .sort((a, b) => b.totalEffectiveInfluence - a.totalEffectiveInfluence);

    return { sortedParties: sorted, totalEffectiveInfluenceInSeat: totalInfluence };
  }, [livingCharactersInSeat, seat, demographics, affiliationToPartyMap, partiesMap, affiliationsMap, seatCode, strongholdMap]);

  const sortedCharacters = useMemo(() => 
    livingCharactersInSeat.map(char => {
      const partyId = affiliationToPartyMap.get(char.affiliationId);
      const party = partyId ? partiesMap.get(partyId) : undefined;
      const contestData = party?.contestedSeats ? party.contestedSeats.get(char.currentSeatCode) : undefined;
      return {
        ...char,
        effectiveInfluence: calculateEffectiveInfluence(char, seat, demographics, affiliationsMap, strongholdMap, contestData?.candidateId, contestData?.allocatedAffiliationId),
      }
    }).sort((a, b) => b.effectiveInfluence - a.effectiveInfluence)
  , [livingCharactersInSeat, seat, demographics, affiliationsMap, affiliationToPartyMap, partiesMap, strongholdMap]);

  const currentMP = useMemo(() => {
      if (electionHistory.length === 0) return null;
      const lastElection = electionHistory[electionHistory.length - 1];
      return lastElection.seatWinners.get(seatCode);
  }, [electionHistory, seatCode]);
  
  const currentMPParty = currentMP ? partiesMap.get(currentMP.partyId) : null;

  const getPartyOrAllianceVotePercent = (electionIndex: number, seatCode: string, partyId: string, historicalAlliances: PoliticalAlliance[]): number | null => {
      const entry = electionHistory[electionIndex];
      if (!entry) return null;
      const seatResults = entry.detailedResults.get(seatCode);
      if (!seatResults) return null;
      
      const totalVotes = Array.from(seatResults.values()).reduce((a, b) => a + b, 0);
      if (totalVotes === 0) return 0;
      
      // Check if partyId was in an alliance during that election
      const alliance = historicalAlliances.find(a => a.memberPartyIds.includes(partyId));
      
      let targetVotes = 0;
      if (alliance) {
          // Sum votes of all alliance members in this seat for that election to represent the "Alliance" swing
          // Assuming normally only one would contest if logic is correct, but if not, summing handles split vote history too.
          alliance.memberPartyIds.forEach(pid => {
              targetVotes += seatResults.get(pid) || 0;
          });
      } else {
          targetVotes = seatResults.get(partyId) || 0;
      }
      
      return (targetVotes / totalVotes) * 100;
  };

  return (
    <div className="absolute top-20 right-4 h-[calc(100%-5.5rem)] w-[400px] bg-gray-800 bg-opacity-95 text-white p-4 shadow-lg overflow-y-auto font-sans z-[1500] flex flex-col rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-2xl font-bold">{seat.properties.PARLIMEN}</h2>
            <button onClick={onClose} className="text-2xl hover:text-red-500">&times;</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-4 shrink-0">
            <button 
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('overview')}
            >
                Overview
            </button>
            <button 
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${activeTab === 'characters' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('characters')}
            >
                Characters <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded-full ml-1">{livingCharactersInSeat.length}</span>
            </button>
            <button 
                 className={`flex-1 pb-2 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => setActiveTab('history')}
            >
                History
            </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Current MP */}
                    <div className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-gray-600 shadow-sm" style={{ borderLeftColor: currentMPParty?.color || '#666' }}>
                        <h4 className="text-xs uppercase text-gray-400 mb-1 font-bold tracking-wider">Member of Parliament</h4>
                        {currentMP ? (
                            <>
                                <div className="text-xl font-bold text-white">{currentMP.candidateName}</div>
                                <div className="text-sm text-gray-300 font-medium">{currentMPParty?.name}</div>
                            </>
                        ) : (
                            <div className="text-lg italic text-gray-500">Seat Vacant</div>
                        )}
                    </div>
                    
                    {/* Stronghold Status */}
                    {stronghold && strongholdAffiliation && (
                        <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-800/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl">🛡️</div>
                            <h4 className="text-xs uppercase text-blue-300 mb-1 font-bold tracking-wider">Political Status</h4>
                            <div className="text-lg font-bold text-white mb-1">{strongholdAffiliation.name} Stronghold</div>
                            <div className="flex items-center gap-2 text-xs text-blue-200">
                                <span className="bg-blue-800/50 px-2 py-0.5 rounded border border-blue-700">{stronghold.terms} Term{stronghold.terms > 1 ? 's' : ''}</span>
                                <span className="font-bold text-green-400">+{Math.round(stronghold.terms * 10)}% Influence Bonus</span>
                            </div>
                        </div>
                    )}

                    {/* Ethnic Composition */}
                    {demographics && (
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                            <h3 className="text-md font-bold mb-3 text-gray-200 flex justify-between items-end">
                                <span>Demographics</span>
                                <span className="text-xs text-gray-400 font-normal">{demographics.totalElectorate.toLocaleString()} voters</span>
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between mb-1 text-xs">
                                        <span className="text-gray-300">Malay</span>
                                        <span className="text-gray-300">{demographics.malayPercent.toFixed(1)}%</span>
                                    </div>
                                    <ProgressBar value={demographics.malayPercent} color="#ffe119" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1 text-xs">
                                        <span className="text-gray-300">Chinese</span>
                                        <span className="text-gray-300">{demographics.chinesePercent.toFixed(1)}%</span>
                                    </div>
                                    <ProgressBar value={demographics.chinesePercent} color="#e6194B" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1 text-xs">
                                        <span className="text-gray-300">Indian</span>
                                        <span className="text-gray-300">{demographics.indianPercent.toFixed(1)}%</span>
                                    </div>
                                    <ProgressBar value={demographics.indianPercent} color="#f58231" />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Party Support */}
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                        <h3 className="text-md font-bold mb-3 text-gray-200">Local Influence</h3>
                        {sortedParties.length > 0 ? (
                             <div className="space-y-3">
                                {sortedParties.map(({ id, percentage }) => {
                                    const party = partiesMap.get(id);
                                    if (!party) return null;
                                    return (
                                        <div key={id} onClick={() => onPartyClick(id)} className="cursor-pointer hover:opacity-80 transition-opacity group">
                                            <div className="flex justify-between mb-1 text-xs group-hover:text-white">
                                                <span className="font-medium" style={{color: party.color}}>{party.name}</span>
                                                <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                                            </div>
                                            <ProgressBar value={percentage} color={party.color} />
                                        </div>
                                    );
                                })}
                                <p className="text-[10px] text-gray-500 text-right mt-2 italic">Based on characters currently in seat</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No significant political presence.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Characters Tab */}
            {activeTab === 'characters' && (
                <div className="animate-fadeIn">
                     {sortedCharacters.length > 0 ? (
                      <ul className="space-y-2">
                          {sortedCharacters.map(char => {
                              const affiliation = affiliationsMap.get(char.affiliationId);
                              const partyId = affiliationToPartyMap.get(char.affiliationId);
                              const party = partyId ? partiesMap.get(partyId) : undefined;
                              return (
                                  <li 
                                    key={char.id} 
                                    className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-600 transition-all border border-transparent hover:border-gray-500"
                                    onClick={() => onCharacterClick(char)}
                                  >
                                      <div>
                                          <div className="flex items-center gap-2">
                                            <p className={`font-bold ${char.isPlayer ? 'text-green-400' : 'text-white'}`}>{char.name}</p>
                                            {char.isMP && <span className="text-[10px] bg-blue-900 text-blue-300 px-1.5 rounded border border-blue-700">MP</span>}
                                          </div>
                                          <p className="text-xs mt-0.5 flex items-center gap-1">
                                              {party && <span className="w-2 h-2 rounded-full" style={{backgroundColor: party.color}}></span>}
                                              <span style={{color: party?.color || '#aaa'}}>{party?.name || 'Independent'}</span>
                                              <span className="text-gray-500">•</span>
                                              <span className="text-gray-400">{affiliation?.name}</span>
                                          </p>
                                      </div>
                                      <div className="text-right bg-gray-800/50 px-2 py-1 rounded">
                                        <p className="font-bold text-amber-400">{char.effectiveInfluence}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">Infl.</p>
                                      </div>
                                  </li>
                              );
                          })}
                      </ul>
                  ) : (
                      <div className="text-center py-10">
                          <p className="text-gray-500 text-lg">No characters found.</p>
                          <p className="text-gray-600 text-sm mt-2">Move a character here to increase influence.</p>
                      </div>
                  )}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="animate-fadeIn space-y-6">
                    {electionHistory.length > 0 ? (
                        [...electionHistory].reverse().map((entry, reverseIdx) => {
                            const electionIdx = electionHistory.length - 1 - reverseIdx;
                            const seatVotesMap = entry.detailedResults.get(seatCode);
                            if (!seatVotesMap) return null;

                            const totalVotes = Array.from(seatVotesMap.values()).reduce((a, b) => a + b, 0);
                            const winner = entry.seatWinners.get(seatCode);
                            const candidatesMap = entry.seatCandidates?.get(seatCode);
                            const alliancesAtTime = entry.alliances || [];

                            const results = Array.from(seatVotesMap.entries()).map(([partyId, votes]) => {
                                const party = partiesMap.get(partyId);
                                const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                                
                                // For swing, use alliance logic if applicable
                                // Check if party was in alliance at THAT time
                                const alliance = alliancesAtTime.find(a => a.memberPartyIds.includes(partyId));
                                // Get previous percent. If in alliance, it compares against alliance's prev performance.
                                const prevPercent = getPartyOrAllianceVotePercent(electionIdx - 1, seatCode, partyId, alliancesAtTime);
                                
                                const swing = prevPercent !== null ? percent - prevPercent : null;
                                const candidateInfo = candidatesMap?.get(partyId);
                                const candidateName = candidateInfo?.name || (winner?.partyId === partyId ? winner.candidateName : 'Unknown Candidate');

                                return {
                                    partyId,
                                    partyName: party?.name || 'Unknown',
                                    partyColor: party?.color || '#666',
                                    candidateName,
                                    votes,
                                    percent,
                                    swing,
                                    isWinner: winner?.partyId === partyId,
                                    allianceName: alliance?.name
                                };
                            }).sort((a, b) => b.votes - a.votes);

                            return (
                                <div key={entry.date.toISOString()} className="bg-gray-900/40 rounded-lg overflow-hidden border border-gray-700">
                                    <div className="bg-gray-800 p-2 border-b border-gray-700 flex justify-between items-center">
                                        <span className="font-bold text-gray-200">{entry.date.getFullYear()} General Election</span>
                                        <span className="text-xs text-gray-400">Total Votes: {totalVotes.toLocaleString()}</span>
                                    </div>
                                    <div className="p-2">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-gray-700">
                                                    <th className="text-left py-1">Candidate / Party</th>
                                                    <th className="text-right py-1">Votes</th>
                                                    <th className="text-right py-1">%</th>
                                                    <th className="text-right py-1">+/-</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700/50">
                                                {results.map((res) => (
                                                    <tr key={res.partyId} className={res.isWinner ? 'bg-green-900/10' : ''}>
                                                        <td className="py-2">
                                                            <div className="font-semibold text-white flex items-center gap-1">
                                                                {res.isWinner && <span className="text-yellow-400 text-[10px]">★</span>}
                                                                {res.candidateName}
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: res.partyColor}}></div>
                                                                <span className="text-gray-400">{res.partyName}</span>
                                                                {res.allianceName && (
                                                                    <span className="text-[10px] bg-gray-700 px-1 rounded text-gray-300 ml-1">{res.allianceName}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-right py-2 font-mono text-gray-300">{res.votes.toLocaleString()}</td>
                                                        <td className="text-right py-2 font-mono text-gray-300">{res.percent.toFixed(1)}%</td>
                                                        <td className={`text-right py-2 font-mono ${res.swing === null ? 'text-gray-500' : res.swing > 0 ? 'text-green-400' : res.swing < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                                            {res.swing === null ? '-' : `${res.swing > 0 ? '+' : ''}${res.swing.toFixed(1)}`}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500 text-lg mb-2">No election history.</p>
                            <p className="text-gray-600 text-sm">Wait for the first General Election.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
