import React, { useMemo } from 'react';
import { Character, Party, PartyElectionVoteTally } from '../types';

interface PartyElectionResultsPanelProps {
  voteTally: PartyElectionVoteTally;
  winnerId: string;
  deputyWinnerId?: string;
  party: Party;
  partyMembers: Character[];
  onClose: () => void;
}

const PartyElectionResultsPanel: React.FC<PartyElectionResultsPanelProps> = ({ voteTally, winnerId, deputyWinnerId, party, partyMembers, onClose }) => {
    const charactersMap = useMemo(() => new Map(partyMembers.map(c => [c.id, c])), [partyMembers]);

    const sortedResults = useMemo(() => {
        return Array.from(voteTally.entries())
            .map(([candidateId, votes]) => ({
                id: candidateId,
                name: charactersMap.get(candidateId)?.name || 'Unknown',
                votes: Math.round(votes)
            }))
            .sort((a,b) => b.votes - a.votes);
    }, [voteTally, charactersMap]);

    const winner = charactersMap.get(winnerId);
    const deputyWinner = deputyWinnerId ? charactersMap.get(deputyWinnerId) : null;

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-[4000] flex items-center justify-center font-sans p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: party.color }}>
                    Election Results
                </h2>
                <p className="text-center text-gray-400 mb-6">{party.name} National Leadership</p>
                
                <div className="text-center bg-gray-700 p-4 rounded-lg mb-6">
                    <p className="text-gray-400">The new National Leader is:</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{winner?.name || 'N/A'}</p>
                    {deputyWinner && (
                        <>
                            <p className="text-gray-400 mt-2">The new Deputy Leader is:</p>
                            <p className="text-xl font-bold text-sky-400 mt-1">{deputyWinner.name}</p>
                        </>
                    )}
                </div>

                <h3 className="font-semibold mb-2 text-gray-300">Vote Tally:</h3>
                <div className="max-h-60 overflow-y-auto pr-2 space-y-1 text-sm">
                    {sortedResults.map(result => (
                        <div key={result.id} className={`p-2 rounded flex justify-between ${result.id === winnerId ? 'bg-green-600/30' : 'bg-gray-700/50'}`}>
                            <span className={result.id === winnerId ? 'font-bold' : ''}>{result.name}</span>
                            <span className="font-mono">{result.votes.toLocaleString()} votes</span>
                        </div>
                    ))}
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

export default PartyElectionResultsPanel;