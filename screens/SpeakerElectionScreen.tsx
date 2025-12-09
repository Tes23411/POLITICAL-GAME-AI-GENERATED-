
import React, { useMemo } from 'react';
import { Character, Party, ElectionResults, SpeakerElectionScreenProps } from '../types';
import { getPartySeatCounts } from '../utils/politics';

const SpeakerElectionScreen: React.FC<SpeakerElectionScreenProps> = ({ candidates, onVote, partiesMap, electionResults, playerPartyId, isSpectator }) => {
    
    const partySeatCounts = useMemo(() => getPartySeatCounts(electionResults, partiesMap), [electionResults, partiesMap]);
    const playerVotes = partySeatCounts.get(playerPartyId) || 0;

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-[4000] flex items-center justify-center font-sans p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-3xl font-bold mb-2 text-center text-amber-400">
                    Election of the Speaker
                </h2>
                {!isSpectator && (
                    <p className="text-center text-gray-400 mb-6">
                        As leader of your party, you must cast your {playerVotes} votes for a candidate.
                    </p>
                )}
                {isSpectator && (
                    <p className="text-center text-gray-400 mb-6">
                        Parliament is electing a new Speaker.
                    </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {candidates.map(candidate => {
                        const party = (Array.from(partiesMap.values()) as Party[]).find(p => p.affiliationIds.includes(candidate.affiliationId));
                        return (
                            <div key={candidate.id} className="bg-gray-700 p-4 rounded-lg flex flex-col text-center items-center">
                                <h3 className="font-bold text-xl">{candidate.name}</h3>
                                {party && <p className="text-sm" style={{ color: party.color }}>{party.name}</p>}
                                <p className="text-xs text-gray-400 mt-2">Influence: {candidate.influence} | Charisma: {candidate.charisma}</p>
                                {!isSpectator && (
                                    <button
                                        onClick={() => onVote(candidate.id)}
                                        className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Vote
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
                {isSpectator && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => onVote('')}
                            className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg text-lg transition-colors"
                        >
                            Observe Results
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeakerElectionScreen;
