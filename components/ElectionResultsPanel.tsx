
import React, { useMemo, useState } from 'react';
import { Party, ElectionResults, PoliticalAlliance } from '../types';

interface ElectionResultsPanelProps {
  results: ElectionResults;
  previousResults: ElectionResults;
  detailedResults: Map<string, Map<string, number>>; // seatCode -> partyId -> votes
  previousDetailedResults: Map<string, Map<string, number>> | null;
  partiesMap: Map<string, Party>;
  totalSeats: number;
  onClose: () => void;
  electionDate: Date;
  totalElectorate: number;
  alliances?: PoliticalAlliance[];
}

interface ResultStats {
    id: string;
    name: string;
    color: string;
    seats: number;
    seatChange: number;
    votes: number;
    votePercentage: number;
    votePercentageChange: number;
    hasParticipated: boolean;
    isAlliance?: boolean;
    members?: ResultStats[];
    type?: string;
}

const ElectionResultsPanel: React.FC<ElectionResultsPanelProps> = ({ results, previousResults, detailedResults, previousDetailedResults, partiesMap, totalSeats, onClose, electionDate, totalElectorate, alliances = [] }) => {
  const [expandedAllianceIds, setExpandedAllianceIds] = useState<Set<string>>(new Set());

  const { stats, totalCurrentVotes, totalCurrentSeats } = useMemo(() => {
    const getSeatCounts = (res: Map<string, string>) => {
        const counts = new Map<string, number>();
        for (const partyId of res.values()) {
            counts.set(partyId, (counts.get(partyId) || 0) + 1);
        }
        return counts;
    };

    const currentSeatCounts = getSeatCounts(results);
    const previousSeatCounts = getSeatCounts(previousResults);

    const currentVoteCounts = new Map<string, number>();
    let totalCurrentVotes = 0;
    if(detailedResults) {
        for (const seatTally of detailedResults.values()) {
            for (const [partyId, votes] of seatTally.entries()) {
                currentVoteCounts.set(partyId, (currentVoteCounts.get(partyId) || 0) + votes);
                totalCurrentVotes += votes;
            }
        }
    }

    const previousVoteCounts = new Map<string, number>();
    let totalPreviousVotes = 0;
    if (previousDetailedResults) {
        for (const seatTally of previousDetailedResults.values()) {
            for (const [partyId, votes] of seatTally.entries()) {
                previousVoteCounts.set(partyId, (previousVoteCounts.get(partyId) || 0) + votes);
                totalPreviousVotes += votes;
            }
        }
    }
    
    const totalCurrentSeats = Array.from(currentSeatCounts.values()).reduce((sum, count) => sum + count, 0);

    const allPartyIds = new Set<string>();
    partiesMap.forEach((_, key) => allPartyIds.add(key));
    currentSeatCounts.forEach((_, key) => allPartyIds.add(key));
    previousSeatCounts.forEach((_, key) => allPartyIds.add(key));
    currentVoteCounts.forEach((_, key) => allPartyIds.add(key));
    previousVoteCounts.forEach((_, key) => allPartyIds.add(key));

    // 1. Calculate individual stats for all parties first
    const partyStatsMap = new Map<string, ResultStats>();
    allPartyIds.forEach(partyId => {
        const party = partiesMap.get(partyId);
        const currentSeats = currentSeatCounts.get(partyId) || 0;
        const previousSeats = previousSeatCounts.get(partyId) || 0;
        const currentVotes = currentVoteCounts.get(partyId) || 0;
        const previousVotes = previousVoteCounts.get(partyId) || 0;

        const currentVotePercentage = totalCurrentVotes > 0 ? (currentVotes / totalCurrentVotes) * 100 : 0;
        const previousVotePercentage = totalPreviousVotes > 0 ? (previousVotes / totalPreviousVotes) * 100 : 0;
        const votePercentageChange = currentVotePercentage - previousVotePercentage;

        partyStatsMap.set(partyId, {
            id: partyId,
            name: party?.name || 'Unknown Party',
            color: party?.color || '#888',
            seats: currentSeats,
            seatChange: currentSeats - previousSeats,
            votes: currentVotes,
            votePercentage: currentVotePercentage,
            votePercentageChange: votePercentageChange,
            hasParticipated: currentSeats > 0 || previousSeats > 0 || currentVotes > 0 || previousVotes > 0,
        });
    });

    // 2. Group into Alliances
    const processedPartyIds = new Set<string>();
    const groupedStats: ResultStats[] = [];

    // Process alliances (type 'Alliance' only)
    alliances.forEach(alliance => {
        if (alliance.type !== 'Alliance') return; // Skip Pacts, they list individually

        const memberStats: ResultStats[] = [];
        let allianceSeats = 0;
        let alliancePreviousSeats = 0;
        let allianceVotes = 0;
        let alliancePreviousVotes = 0;
        
        let hasParticipation = false;

        alliance.memberPartyIds.forEach(pid => {
            const pStat = partyStatsMap.get(pid);
            if (pStat) {
                memberStats.push(pStat);
                allianceSeats += pStat.seats;
                alliancePreviousSeats += pStat.seats; // Note: seatChange logic is simplified sum
                allianceVotes += pStat.votes;
                // For previous votes, we need raw previous votes to calc swing correctly
                const prevVotes = previousVoteCounts.get(pid) || 0;
                alliancePreviousVotes += prevVotes;

                if (pStat.hasParticipated) hasParticipation = true;
                processedPartyIds.add(pid);
            }
        });

        if (hasParticipation) {
            const allianceVotePercentage = totalCurrentVotes > 0 ? (allianceVotes / totalCurrentVotes) * 100 : 0;
            const alliancePreviousVotePercentage = totalPreviousVotes > 0 ? (alliancePreviousVotes / totalPreviousVotes) * 100 : 0;
            const leaderParty = partiesMap.get(alliance.leaderPartyId);

            groupedStats.push({
                id: alliance.id,
                name: alliance.name,
                color: leaderParty?.color || '#fff',
                seats: allianceSeats,
                seatChange: memberStats.reduce((sum, m) => sum + m.seatChange, 0),
                votes: allianceVotes,
                votePercentage: allianceVotePercentage,
                votePercentageChange: allianceVotePercentage - alliancePreviousVotePercentage,
                hasParticipated: true,
                isAlliance: true,
                members: memberStats.sort((a,b) => b.seats - a.seats),
                type: 'Alliance'
            });
        }
    });

    // Process remaining independent parties or pact members
    partyStatsMap.forEach((stat, pid) => {
        if (!processedPartyIds.has(pid) && stat.hasParticipated) {
            groupedStats.push(stat);
        }
    });

    const sortedStats = groupedStats.sort((a, b) => b.seats - a.seats || b.votes - a.votes);

    return { stats: sortedStats, totalCurrentVotes, totalCurrentSeats };
}, [results, previousResults, detailedResults, previousDetailedResults, partiesMap, alliances]);

  const majoritySeats = Math.floor(totalSeats / 2) + 1;
  const turnout = totalElectorate > 0 && totalCurrentVotes > 0 ? (totalCurrentVotes / totalElectorate) * 100 : 0;

  const toggleAlliance = (id: string) => {
      const newSet = new Set(expandedAllianceIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setExpandedAllianceIds(newSet);
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 z-[2000] flex items-center justify-center font-sans p-4">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-600">
        <h2 className="text-3xl font-bold mb-2 text-center text-amber-400">
          {electionDate.getFullYear()} General Election Results
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4 border-y border-gray-700 py-3 text-sm">
            <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Total Seats</div>
                <div className="text-lg font-bold">{totalSeats}</div>
            </div>
            <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Majority</div>
                <div className="text-lg font-bold">{majoritySeats}</div>
            </div>
            <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Valid Votes</div>
                <div className="text-lg font-bold">{totalCurrentVotes.toLocaleString()}</div>
            </div>
            <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Turnout</div>
                <div className="text-lg font-bold">{turnout > 0 ? `${turnout.toFixed(2)}%` : 'N/A'}</div>
            </div>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <table className="w-full text-left text-sm table-fixed border-collapse">
                <thead className="bg-gray-900/70 sticky top-0 z-10">
                    <tr>
                        <th className="p-2 font-semibold uppercase tracking-wider text-gray-300 w-[30%] border-b border-gray-600">Party / Alliance</th>
                        <th className="p-2 font-semibold uppercase tracking-wider text-gray-300 w-[15%] text-right border-b border-gray-600">Votes</th>
                        <th className="p-2 font-semibold uppercase tracking-wider text-gray-300 w-[10%] text-right border-b border-gray-600">%</th>
                        <th className="p-2 font-semibold uppercase tracking-wider text-gray-300 w-[10%] text-right border-b border-gray-600">Swing</th>
                        <th className="p-2 font-semibold uppercase tracking-wider text-gray-300 w-[20%] border-b border-gray-600">Seats</th>
                        <th className="p-2 font-semibold uppercase tracking-wider text-gray-300 w-[8%] text-center border-b border-gray-600">#</th>
                        <th className="p-2 font-semibold uppercase tracking-wider text-gray-300 w-[7%] text-center border-b border-gray-600">+/-</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((p, index) => (
                        <React.Fragment key={p.id}>
                            <tr 
                                className={`${index % 2 === 0 ? 'bg-gray-700/40' : 'bg-gray-700/20'} ${p.isAlliance ? 'cursor-pointer hover:bg-gray-700/60' : ''}`}
                                onClick={() => p.isAlliance && toggleAlliance(p.id)}
                            >
                                <td className="p-2 flex items-center border-b border-gray-700">
                                    {p.isAlliance && (
                                        <span className="mr-2 text-xs text-gray-400">{expandedAllianceIds.has(p.id) ? '▼' : '▶'}</span>
                                    )}
                                    <div className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" style={{ backgroundColor: p.color }}></div>
                                    <span className={`truncate ${p.isAlliance ? 'font-bold text-base' : 'font-medium'}`}>{p.name}</span>
                                </td>
                                <td className="p-2 text-right font-mono border-b border-gray-700">{p.votes.toLocaleString()}</td>
                                <td className="p-2 text-right font-mono border-b border-gray-700">{p.votePercentage.toFixed(2)}</td>
                                <td className={`p-2 text-right font-mono border-b border-gray-700 ${p.votePercentageChange > 0 ? 'text-green-400' : p.votePercentageChange < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                {previousDetailedResults ? `${p.votePercentageChange > 0 ? '+' : ''}${p.votePercentageChange.toFixed(2)}` : '–'}
                                </td>
                                <td className="p-2 align-middle border-b border-gray-700">
                                    {p.seats > 0 && (
                                        <div className="w-full bg-gray-600/50 h-5 relative rounded-sm">
                                            <div className="h-5" style={{ backgroundColor: p.color, width: `${(p.seats / totalSeats) * 100}%` }}></div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-2 text-center font-mono font-bold text-lg border-b border-gray-700">{p.seats}</td>
                                <td className={`p-2 text-center font-mono border-b border-gray-700 ${p.seatChange > 0 ? 'text-green-400' : p.seatChange < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                    {previousResults.size > 0 ? (p.seatChange > 0 ? `+${p.seatChange}` : p.seatChange) : '–'}
                                </td>
                            </tr>
                            
                            {/* Member Rows */}
                            {p.isAlliance && expandedAllianceIds.has(p.id) && p.members?.map(m => (
                                <tr key={m.id} className="bg-gray-800/50 text-gray-300 text-xs">
                                     <td className="p-2 pl-10 flex items-center border-b border-gray-700/50">
                                        <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: m.color }}></div>
                                        <span className="truncate">{m.name}</span>
                                    </td>
                                    <td className="p-2 text-right font-mono border-b border-gray-700/50">{m.votes.toLocaleString()}</td>
                                    <td className="p-2 text-right font-mono border-b border-gray-700/50">{m.votePercentage.toFixed(2)}</td>
                                    <td className={`p-2 text-right font-mono border-b border-gray-700/50 ${m.votePercentageChange > 0 ? 'text-green-400/70' : m.votePercentageChange < 0 ? 'text-red-400/70' : 'text-gray-500'}`}>
                                        {previousDetailedResults ? `${m.votePercentageChange > 0 ? '+' : ''}${m.votePercentageChange.toFixed(2)}` : '–'}
                                    </td>
                                    <td className="p-2 align-middle border-b border-gray-700/50">
                                        {m.seats > 0 && (
                                            <div className="w-full bg-gray-700 h-2 relative rounded-sm">
                                                <div className="h-2" style={{ backgroundColor: m.color, width: `${(m.seats / totalSeats) * 100}%` }}></div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-2 text-center font-mono font-medium border-b border-gray-700/50">{m.seats}</td>
                                    <td className={`p-2 text-center font-mono border-b border-gray-700/50 ${m.seatChange > 0 ? 'text-green-400/70' : m.seatChange < 0 ? 'text-red-400/70' : 'text-gray-500'}`}>
                                        {previousResults.size > 0 ? (m.seatChange > 0 ? `+${m.seatChange}` : m.seatChange) : '–'}
                                    </td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
                 <tfoot className="bg-gray-900/70 font-bold text-gray-300">
                    <tr>
                        <td className="p-2 uppercase">Total</td>
                        <td className="p-2 text-right font-mono">{totalCurrentVotes.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono">100.00</td>
                        <td className="p-2"></td>
                        <td className="p-2"></td>
                        <td className="p-2 text-center font-mono text-lg">{totalCurrentSeats}</td>
                        <td className="p-2"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={onClose} 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-transform transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElectionResultsPanel;
