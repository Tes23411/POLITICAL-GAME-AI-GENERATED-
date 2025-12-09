
import React, { useMemo } from 'react';
import { Character, Party, SpeakerVoteTally, SpeakerVoteBreakdown } from '../types';

interface SpeakerElectionResultsPanelProps {
  results: { 
      winner: Character; 
      tally: SpeakerVoteTally; 
      breakdown: SpeakerVoteBreakdown;
  };
  partiesMap: Map<string, Party>;
  characters: Character[];
  onClose: () => void;
}

const SpeakerElectionResultsPanel: React.FC<SpeakerElectionResultsPanelProps> = ({ results, partiesMap, onClose, characters }) => {
    const { winner, tally } = results;
    const charactersMap = useMemo(() => new Map(characters.map(c => [c.id, c])), [characters]);
    const sortedTally = useMemo(() => Array.from(tally.entries()).sort((a,b) => b[1] - a[1]), [tally]);

    if (!winner) {
        return (
            <div className="absolute inset-0 bg-black bg-opacity-75 z-[5000] flex items-center justify-center font-sans p-4">
                <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-lg text-center">
                    <h2 className="text-xl font-bold mb-4 text-red-400">Election Error</h2>
                    <p className="text-gray-300 mb-6">Unable to determine speaker election results.</p>
                    <button 
                        onClick={onClose} 
                        className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-[5000] flex items-center justify-center font-sans p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-3xl font-bold mb-2 text-center text-amber-400">
                    Speaker Election Results
                </h2>
                
                <div className="text-center bg-gray-700 p-4 rounded-lg mb-6">
                    <p className="text-gray-400">The new Speaker of Parliament is:</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{winner.name}</p>
                </div>

                <h3 className="font-semibold mb-2 text-gray-300">Vote Tally:</h3>
                <div className="space-y-1 text-sm">
                    {sortedTally.map(([candidateId, votes]) => (
                        <div key={candidateId} className={`p-2 rounded flex justify-between ${candidateId === winner.id ? 'bg-green-600/30' : 'bg-gray-700/50'}`}>
                            <span className={candidateId === winner.id ? 'font-bold' : ''}>{charactersMap.get(candidateId)?.name || 'Unknown Candidate'}</span>
                            <span className="font-mono">{votes.toLocaleString()} votes</span>
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

export default SpeakerElectionResultsPanel;
