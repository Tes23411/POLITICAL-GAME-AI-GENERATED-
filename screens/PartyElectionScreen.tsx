
import React from 'react';
import { Character, Party, Affiliation } from '../types';

interface PartyElectionScreenProps {
  party: Party;
  candidates: Character[];
  affiliationsMap: Map<string, Affiliation>;
  onVote: (candidateId?: string) => void;
  isPlayerEligibleToVote: boolean;
}

const PartyElectionScreen: React.FC<PartyElectionScreenProps> = ({ party, candidates, affiliationsMap, onVote, isPlayerEligibleToVote }) => {
    const sortedCandidates = [...candidates].sort((a,b) => b.influence - a.influence);

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-[4000] flex items-center justify-center font-sans p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: party.color }}>
                    {party.name} Leadership Election
                </h2>
                <p className="text-center text-gray-400 mb-2">State Leaders are the primary candidates for party leadership.</p>
                <p className="text-center text-yellow-500 mb-6 text-sm font-semibold bg-yellow-900/20 py-2 rounded border border-yellow-700/30">
                    Constitution: Only State Party Leaders and State Executives are eligible to vote.
                </p>
                
                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedCandidates.map(candidate => {
                        const affiliation = affiliationsMap.get(candidate.affiliationId);
                        return (
                            <div key={candidate.id} className="bg-gray-700 p-4 rounded-lg flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">{candidate.name} {candidate.isPlayer ? "(You)" : ""}</h3>
                                    <p className="text-sm text-gray-400">{affiliation?.name || 'No Affiliation'}</p>
                                    <div className="text-xs mt-2 space-y-1 text-gray-300">
                                        <p>Influence: {candidate.influence}</p>
                                        <p>Charisma: {candidate.charisma}</p>
                                        <p>Recognition: {candidate.recognition}</p>
                                    </div>
                                </div>
                                {isPlayerEligibleToVote && (
                                    <button
                                        onClick={() => onVote(candidate.id)}
                                        className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Vote for {candidate.name.split(' ')[0]}
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>

                {!isPlayerEligibleToVote && (
                    <div className="mt-6 text-center space-y-3">
                         <p className="text-gray-400 italic">You are not eligible to cast a vote in this election.</p>
                        <button
                            onClick={() => onVote(undefined)}
                            className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg text-lg transition-transform transform hover:scale-105"
                        >
                            Observe Results
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartyElectionScreen;
