

import React, { useState, useMemo } from 'react';
import { Party, ElectionResults, PoliticalAlliance, GovernmentFormationScreenProps } from '../types';
import { getPartySeatCounts, getCoalitionAcceptanceChance } from '../utils/politics';

const GovernmentFormationScreen: React.FC<GovernmentFormationScreenProps> = ({ 
    playerParty, parties, electionResults, totalSeats, alliances, onConfirm, onAuto 
}) => {
    const [coalitionIds, setCoalitionIds] = useState<Set<string>>(new Set([playerParty.id]));
    
    const partiesMap = useMemo(() => new Map(parties.map(p => [p.id, p])), [parties]);
    const seatCounts = useMemo(() => getPartySeatCounts(electionResults, partiesMap), [electionResults, partiesMap]);
    const majorityThreshold = Math.floor(totalSeats / 2) + 1;

    // Determine which alliance the player is in (if any) to initialize correctly
    useMemo(() => {
        const playerAlliance = alliances.find(a => a.memberPartyIds.includes(playerParty.id));
        if (playerAlliance) {
             // If player is in an alliance, pre-select all members
             setCoalitionIds(prev => {
                 const next = new Set(prev);
                 playerAlliance.memberPartyIds.forEach(id => next.add(id));
                 return next;
             });
        }
    }, [alliances, playerParty.id]);

    const sortedParties = useMemo(() => {
        return parties
            .filter(p => (seatCounts.get(p.id) || 0) > 0 && p.id !== playerParty.id)
            .sort((a,b) => (seatCounts.get(b.id) || 0) - (seatCounts.get(a.id) || 0));
    }, [parties, seatCounts, playerParty.id]);

    const coalitionStats = useMemo(() => {
        let currentSeats = 0;
        coalitionIds.forEach(id => {
            currentSeats += seatCounts.get(id) || 0;
        });
        
        const coalitionParties = Array.from(coalitionIds).map(id => partiesMap.get(id)!);
        
        // Calculate average ideology
        const avgEco = coalitionParties.length > 0 ? coalitionParties.reduce((sum, p) => sum + p.ideology.economic, 0) / coalitionParties.length : 0;
        const avgGov = coalitionParties.length > 0 ? coalitionParties.reduce((sum, p) => sum + p.ideology.governance, 0) / coalitionParties.length : 0;
        
        // Calculate Stability (Inverse of max ideological distance)
        let maxDist = 0;
        for(let i=0; i<coalitionParties.length; i++) {
            for(let j=i+1; j<coalitionParties.length; j++) {
                const p1 = coalitionParties[i];
                const p2 = coalitionParties[j];
                const dist = Math.sqrt(Math.pow(p1.ideology.economic - p2.ideology.economic, 2) + Math.pow(p1.ideology.governance - p2.ideology.governance, 2));
                if (dist > maxDist) maxDist = dist;
            }
        }
        const stability = Math.max(0, 100 - maxDist);

        return { currentSeats, avgEco, avgGov, stability };
    }, [coalitionIds, seatCounts, partiesMap]);

    const toggleParty = (partyId: string) => {
        const newSet = new Set(coalitionIds);
        
        // Check if this party belongs to an Alliance
        const alliance = alliances.find(a => a.memberPartyIds.includes(partyId));
        
        const partiesToToggle = alliance ? alliance.memberPartyIds : [partyId];
        
        // Determine if we are adding or removing (based on the clicked party)
        const isRemoving = newSet.has(partyId);

        partiesToToggle.forEach(pid => {
             // Don't remove player party ever
             if (pid === playerParty.id) return;
             
             if (isRemoving) {
                 newSet.delete(pid);
             } else {
                 newSet.add(pid);
             }
        });

        setCoalitionIds(newSet);
    };

    const handleConfirm = () => {
        onConfirm(Array.from(coalitionIds));
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-[5000] flex items-center justify-center font-sans p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col border border-gray-700">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-amber-400">Form Government</h2>
                        <p className="text-gray-400 text-sm">Negotiate with other parties to form a ruling coalition.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{coalitionStats.currentSeats} / {totalSeats}</div>
                        <div className={`text-sm font-semibold ${coalitionStats.currentSeats >= majorityThreshold ? 'text-green-400' : 'text-red-400'}`}>
                            {coalitionStats.currentSeats >= majorityThreshold ? 'Majority Reached' : `Need ${majorityThreshold - coalitionStats.currentSeats} more`}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden">
                    {/* Left: My Party & Stats */}
                    <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col space-y-4">
                         <div className="bg-gray-800 p-4 rounded border-l-4" style={{borderLeftColor: playerParty.color}}>
                             <h3 className="font-bold text-lg">{playerParty.name} (You)</h3>
                             <p className="text-gray-400">{seatCounts.get(playerParty.id)} Seats</p>
                         </div>

                         <div className="bg-gray-800 p-4 rounded flex-grow">
                             <h4 className="font-bold text-gray-300 mb-4 border-b border-gray-700 pb-2">Coalition Stability</h4>
                             
                             <div className="mb-4">
                                 <div className="flex justify-between text-sm mb-1">
                                     <span>Cohesion</span>
                                     <span className={coalitionStats.stability > 70 ? 'text-green-400' : coalitionStats.stability > 40 ? 'text-yellow-400' : 'text-red-400'}>
                                         {Math.round(coalitionStats.stability)}%
                                     </span>
                                 </div>
                                 <div className="w-full bg-gray-700 rounded-full h-2">
                                     <div className={`h-2 rounded-full ${coalitionStats.stability > 70 ? 'bg-green-500' : coalitionStats.stability > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${coalitionStats.stability}%`}}></div>
                                 </div>
                             </div>

                             <div className="text-xs text-gray-400 space-y-2">
                                 <p>Ideological Center: <span className="text-blue-300">Eco {Math.round(coalitionStats.avgEco)}</span> / <span className="text-purple-300">Gov {Math.round(coalitionStats.avgGov)}</span></p>
                                 <p className="italic">A stable coalition ensures smoother governance and bill passing.</p>
                             </div>
                         </div>
                    </div>

                    {/* Center/Right: Potential Partners */}
                    <div className="lg:col-span-2 bg-gray-900/50 p-4 rounded-lg overflow-y-auto">
                        <h3 className="font-bold text-gray-300 mb-3 sticky top-0 bg-gray-900/90 p-2 z-10">Potential Partners</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {sortedParties.map(party => {
                                const acceptance = getCoalitionAcceptanceChance(playerParty, party, Array.from(coalitionIds).map(id => partiesMap.get(id)!));
                                const acceptancePercent = Math.round(acceptance * 100);
                                const acceptanceColor = acceptance > 0.7 ? 'text-green-400' : acceptance > 0.4 ? 'text-yellow-400' : 'text-red-400';
                                const isSelected = coalitionIds.has(party.id);
                                const alliance = alliances.find(a => a.memberPartyIds.includes(party.id));

                                return (
                                    <div 
                                        key={party.id} 
                                        onClick={() => toggleParty(party.id)}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg" style={{color: party.color}}>{party.name}</span>
                                                    {alliance && (
                                                        <span className="text-[10px] bg-gray-700 px-1.5 rounded border border-gray-600 text-gray-300 whitespace-nowrap">
                                                            {alliance.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="ml-0 text-sm bg-gray-700 px-2 py-0.5 rounded text-white mt-1 inline-block">{seatCounts.get(party.id)} Seats</span>
                                            </div>
                                            {isSelected && <span className="text-blue-400 font-bold text-xl">✓</span>}
                                        </div>
                                        
                                        <div className="text-xs text-gray-400 flex justify-between items-end mt-2">
                                            <div>
                                                <p>Relation: {playerParty.relations.get(party.id) || 50}</p>
                                                <p>Ideology: {Math.round(party.ideology.economic)}/{Math.round(party.ideology.governance)}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block uppercase text-[10px] text-gray-500">Acceptance</span>
                                                <span className={`font-bold ${acceptanceColor} text-sm`}>{acceptancePercent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
                    <button onClick={onAuto} className="text-sm text-gray-400 hover:text-white underline">
                        Skip (Auto-Form)
                    </button>
                    <div className="flex gap-4">
                         <div className="text-right mr-4">
                             <span className="block text-xs text-gray-400 uppercase">Total Coalition Seats</span>
                             <span className={`text-2xl font-bold ${coalitionStats.currentSeats >= majorityThreshold ? 'text-green-500' : 'text-gray-500'}`}>{coalitionStats.currentSeats}</span>
                         </div>
                        <button 
                            onClick={handleConfirm} 
                            disabled={coalitionStats.currentSeats < majorityThreshold}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg"
                        >
                            Form Government
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovernmentFormationScreen;
