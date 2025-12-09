
import React, { useState, useMemo } from 'react';
import { Party, Affiliation, PartyManagementScreenProps } from '../types';
import { aiManagePartyContests, distributeAllianceSeats } from '../utils/politics';
import IdeologyCompass from '../components/IdeologyCompass';

const PartyManagementScreen: React.FC<PartyManagementScreenProps> = ({
    party,
    allParties,
    allSeatFeatures,
    affiliationsMap,
    featuresMap,
    demographicsMap,
    characters,
    onSave,
    onClose,
    alliances,
    currentDate,
    strongholdMap
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'strategy'>('overview');
    
    // Detect if this party is part of an alliance
    const currentAlliance = useMemo(() => alliances.find(a => a.memberPartyIds.includes(party.id)), [alliances, party.id]);
    
    // Initialize state with a proper copy of ALL relevant parties (if alliance) or just this party
    const [localParties, setLocalParties] = useState<Party[]>(() => {
        const partyIdsToLoad = currentAlliance ? currentAlliance.memberPartyIds : [party.id];
        return allParties
            .filter(p => partyIdsToLoad.includes(p.id))
            .map(p => {
                const clone: Party = {
                    ...p,
                    affiliationIds: [...p.affiliationIds],
                    stateBranches: p.stateBranches.map(b => ({
                        ...b,
                        executiveIds: [...b.executiveIds]
                    })),
                    contestedSeats: new Map(),
                    leaderHistory: p.leaderHistory.map(h => ({...h})),
                    relations: new Map(p.relations),
                    ideology: {...p.ideology}
                };
                p.contestedSeats.forEach((value, key) => {
                    clone.contestedSeats.set(key, { ...value });
                });
                return clone;
            });
    });

    const primaryParty = localParties.find(p => p.id === party.id) || localParties[0];
    const partyAffiliations = primaryParty.affiliationIds.map(id => affiliationsMap.get(id)).filter(Boolean) as Affiliation[];

    // Helper to update state for a specific party
    const updatePartyState = (partyId: string, updater: (p: Party) => Party) => {
        setLocalParties(prev => prev.map(p => p.id === partyId ? updater(p) : p));
    };

    const handleUpdateContestAllocation = (seatCode: string, assignedPartyId: string | null, allocatedAffiliationId: string | null) => {
        localParties.forEach(p => {
             if (p.contestedSeats.has(seatCode)) {
                 const newContested = new Map<string, { allocatedAffiliationId: string | null; candidateId: string | null; }>(p.contestedSeats);
                 newContested.delete(seatCode);
                 updatePartyState(p.id, prev => ({ ...prev, contestedSeats: newContested }));
             }
        });

        if (assignedPartyId) {
             setLocalParties(prev => prev.map(p => {
                 const newContested = new Map<string, { allocatedAffiliationId: string | null; candidateId: string | null; }>(p.contestedSeats);
                 newContested.delete(seatCode);
                 
                 if (p.id === assignedPartyId) {
                     newContested.set(seatCode, {
                         allocatedAffiliationId: allocatedAffiliationId || null,
                         candidateId: null 
                     });
                 }
                 return { ...p, contestedSeats: newContested };
             }));
        }
    };
    
    const handleUpdateAffiliationFocus = (seatCode: string, affId: string | null) => {
        const newContested = new Map<string, { allocatedAffiliationId: string | null; candidateId: string | null; }>(primaryParty.contestedSeats);
        const current = newContested.get(seatCode);
        if(current) {
            newContested.set(seatCode, { ...current, allocatedAffiliationId: affId });
            updatePartyState(primaryParty.id, prev => ({ ...prev, contestedSeats: newContested }));
        }
    };

    const handleAutoContest = () => {
        const allSeatCodes = allSeatFeatures.map(f => f.properties.UNIQUECODE).filter(Boolean);

        if (currentAlliance) {
            const updatedParties = distributeAllianceSeats(
                currentAlliance,
                localParties,
                allSeatCodes,
                demographicsMap,
                featuresMap,
                affiliationsMap,
                characters,
                strongholdMap
            );
            setLocalParties(updatedParties);
        } else {
            const updatedParty = aiManagePartyContests(
                primaryParty,
                characters,
                allSeatCodes,
                featuresMap,
                demographicsMap,
                affiliationsMap,
                strongholdMap
            );
            setLocalParties([updatedParty]);
        }
    };

    const handleBoostUnity = () => {
        updatePartyState(primaryParty.id, prev => ({ ...prev, unity: Math.min(100, prev.unity + 10) }));
    };
    
    const handleChangeIdeology = (ethnicity: 'Malay' | 'Chinese' | 'Indian' | undefined) => {
        updatePartyState(primaryParty.id, prev => ({ ...prev, ethnicityFocus: ethnicity }));
    };

    const handleConfirm = () => {
        onSave(localParties);
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-[3000] flex items-center justify-center font-sans p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-3">
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-bold" style={{ color: primaryParty.color }}>
                            Manage {primaryParty.name}
                        </h2>
                        {currentAlliance && (
                            <span className="text-sm text-blue-300">
                                Member of {currentAlliance.name}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-3xl hover:text-red-500">&times;</button>
                </div>
                
                {/* Tabs */}
                <div className="flex mb-4 border-b border-gray-700">
                     <button 
                        className={`px-4 py-2 font-semibold ${activeTab === 'overview' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Internal Affairs
                    </button>
                    <button 
                        className={`px-4 py-2 font-semibold ${activeTab === 'strategy' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('strategy')}
                    >
                        Election Strategy
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Ideology Chart */}
                                 <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex flex-col items-center">
                                     <h3 className="text-xl font-bold mb-3 text-gray-200">Political Stance</h3>
                                     <IdeologyCompass 
                                        mainIdeology={primaryParty.ideology} 
                                        mainLabel={primaryParty.name} 
                                        size={200}
                                        otherIdeologies={partyAffiliations.map(aff => ({
                                            ideology: aff.ideology || { economic: 50, governance: 50 },
                                            label: aff.name,
                                            color: '#888'
                                        }))}
                                     />
                                     <p className="text-xs text-gray-400 mt-2 text-center w-full px-4">
                                         Ideology is the average of all member factions. Mergers or recruiting new factions will shift this stance.
                                     </p>
                                 </div>

                                 <div className="space-y-6">
                                     {/* Unity Section */}
                                     <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                         <h3 className="text-xl font-bold mb-3 text-amber-400">Party Unity</h3>
                                         <div className="flex items-center gap-4 mb-3">
                                             <div className="flex-grow bg-gray-900 h-6 rounded-full overflow-hidden border border-gray-500">
                                                 <div 
                                                    className={`h-full transition-all duration-500 ${primaryParty.unity > 70 ? 'bg-green-500' : primaryParty.unity > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${primaryParty.unity}%` }}
                                                 ></div>
                                             </div>
                                             <span className="font-bold text-lg w-12 text-right">{Math.round(primaryParty.unity)}%</span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                             <p className="text-sm text-gray-400">
                                                 Low unity increases split risk.
                                             </p>
                                             <button 
                                                onClick={handleBoostUnity}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg text-sm flex items-center gap-2"
                                                disabled={primaryParty.unity >= 100}
                                             >
                                                 <span>Hold Party Conference</span>
                                                 <span className="bg-black/20 px-1.5 rounded text-xs">+10 Unity</span>
                                             </button>
                                         </div>
                                     </div>

                                     {/* Ideology Section */}
                                     <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                         <h3 className="text-xl font-bold mb-3 text-purple-400">Constitution</h3>
                                         <div className="flex items-center gap-6">
                                             <div>
                                                 <label className="block text-sm font-bold text-gray-400 mb-1">Ethnicity Focus</label>
                                                 <select 
                                                    value={primaryParty.ethnicityFocus || ''} 
                                                    onChange={(e) => handleChangeIdeology(e.target.value ? e.target.value as any : undefined)}
                                                    className="bg-gray-900 text-white p-2 rounded border border-gray-500 w-full"
                                                 >
                                                     <option value="">Multi-Ethnic (Open)</option>
                                                     <option value="Malay">Malay Only</option>
                                                     <option value="Chinese">Chinese Only</option>
                                                     <option value="Indian">Indian Only</option>
                                                 </select>
                                             </div>
                                             <div className="flex-grow">
                                                 <p className="text-sm text-gray-300">
                                                     {primaryParty.ethnicityFocus 
                                                        ? `Restricts membership to ${primaryParty.ethnicityFocus} characters only. Solidifies core support but limits expansion.`
                                                        : "Open to all ethnic backgrounds. Broadens appeal but may dilute core support base."
                                                     }
                                                 </p>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                            </div>
                             
                             {/* Relations Section */}
                             <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                 <h3 className="text-xl font-bold mb-3 text-blue-400">Inter-Party Relations</h3>
                                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                     {Array.from(primaryParty.relations.entries()).map(([otherId, score]) => {
                                         const otherParty = allParties.find(p => p.id === otherId);
                                         if (!otherParty) return null;
                                         
                                         let status = 'Neutral';
                                         let statusColor = 'text-gray-400';
                                         if (score > 75) { status = 'Ally'; statusColor = 'text-green-400'; }
                                         else if (score > 60) { status = 'Friendly'; statusColor = 'text-green-200'; }
                                         else if (score < 40) { status = 'Hostile'; statusColor = 'text-red-400'; }

                                         return (
                                             <div key={otherId} className="bg-gray-800 p-3 rounded border border-gray-600 flex justify-between items-center">
                                                 <span className="font-bold" style={{color: otherParty.color}}>{otherParty.name}</span>
                                                 <div className="text-right">
                                                     <span className={`block text-xs font-bold ${statusColor}`}>{status}</span>
                                                     <span className="text-xs text-gray-500">{score}/100</span>
                                                 </div>
                                             </div>
                                         );
                                     })}
                                 </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'strategy' && (
                        <div className="animate-fadeIn">
                            <div className="sticky top-0 bg-gray-800 py-2 z-10 flex justify-between items-center border-b border-gray-600 mb-2">
                                <p className="text-gray-400 text-sm">
                                    {currentAlliance 
                                        ? `Alliance Mode: Negotiate allocations to avoid vote splitting.` 
                                        : "Decide which seats to contest."}
                                </p>
                                <button
                                    onClick={handleAutoContest}
                                    className="px-4 py-1 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded transition-colors"
                                >
                                    Auto-Allocate
                                </button>
                            </div>

                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="p-2 w-1/3">Constituency</th>
                                        <th className="p-2 w-1/3 text-center">{currentAlliance ? "Coalition Candidate" : "Contesting"}</th>
                                        <th className="p-2 w-1/3">Affiliation Focus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {allSeatFeatures.map(seat => {
                                        const seatCode = seat.properties.UNIQUECODE;
                                        if (!seatCode) return null;
                                        
                                        const contestingParty = localParties.find(p => p.contestedSeats.has(seatCode));
                                        const isContesting = !!contestingParty;
                                        const isMyPartyContesting = contestingParty?.id === primaryParty.id;
                                        const contestData = isMyPartyContesting ? primaryParty.contestedSeats.get(seatCode) : null;

                                        return (
                                            <tr key={seatCode} className="hover:bg-gray-700/50">
                                                <td className="p-2 font-semibold">{seat.properties.PARLIMEN}</td>
                                                <td className="p-2 text-center">
                                                    {currentAlliance ? (
                                                        <select
                                                            value={contestingParty ? contestingParty.id : ''}
                                                            onChange={(e) => handleUpdateContestAllocation(seatCode, e.target.value || null, null)}
                                                            className="bg-gray-600 text-white p-1 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                                                            style={{ 
                                                                backgroundColor: contestingParty ? contestingParty.color : undefined,
                                                                color: contestingParty ? '#fff' : undefined,
                                                                textShadow: contestingParty ? '0 1px 2px black' : undefined
                                                            }}
                                                        >
                                                            <option value="" className="bg-gray-600">-- No Candidate --</option>
                                                            {localParties.map(p => (
                                                                <option key={p.id} value={p.id} className="bg-gray-700">{p.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <label htmlFor={`toggle-${seatCode}`} className="flex items-center cursor-pointer justify-center">
                                                            <div className="relative">
                                                                <input 
                                                                    type="checkbox" 
                                                                    id={`toggle-${seatCode}`} 
                                                                    className="sr-only" 
                                                                    checked={isContesting}
                                                                    onChange={(e) => handleUpdateContestAllocation(seatCode, e.target.checked ? primaryParty.id : null, null)}
                                                                />
                                                                <div className={`block w-10 h-5 rounded-full ${isContesting ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                                                                <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isContesting ? 'translate-x-5' : ''}`}></div>
                                                            </div>
                                                        </label>
                                                    )}
                                                </td>
                                                <td className="p-2">
                                                    {isMyPartyContesting && (
                                                        <select 
                                                            value={contestData?.allocatedAffiliationId || ''}
                                                            onChange={(e) => handleUpdateAffiliationFocus(seatCode, e.target.value || null)}
                                                            className="bg-gray-600 text-white p-1 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        >
                                                            <option value="">Default (No Focus)</option>
                                                            {partyAffiliations.map(aff => (
                                                                <option key={aff.id} value={aff.id}>{aff.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    {isContesting && !isMyPartyContesting && (
                                                        <span className="text-gray-500 text-xs italic">Managed by partner</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>

                <div className="mt-6 flex justify-end items-center gap-4 border-t border-gray-700 pt-4">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 font-bold rounded-lg">Cancel</button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Confirm Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartyManagementScreen;