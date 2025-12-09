
import React, { useMemo } from 'react';
import { Character, Party, ActionType, CharacterRole, CharacterActionScreenProps } from '../types';

const CharacterActionScreen: React.FC<CharacterActionScreenProps> = ({ player, onClose, onPerformAction, characters, partiesMap, affiliationToPartyMap, roleInfo, isAffiliationLeader, daysUntilElection, alliances, government }) => {
    const rivalPartiesInSeat = useMemo(() => {
        const playerPartyId = affiliationToPartyMap.get(player.affiliationId);
        const rivals = new Map<string, Party>();
        characters.forEach(c => {
            if (c.currentSeatCode === player.currentSeatCode && c.id !== player.id) {
                const partyId = affiliationToPartyMap.get(c.affiliationId);
                if (partyId && partyId !== playerPartyId) {
                    const party = partiesMap.get(partyId);
                    if (party) {
                        rivals.set(partyId, party);
                    }
                }
            }
        });
        return Array.from(rivals.values());
    }, [player, characters, partiesMap, affiliationToPartyMap]);
    
    const isStateExecutive = roleInfo.role === 'State Executive';
    const isStateLeader = roleInfo.role === 'State Leader';
    const isPartyLeader = roleInfo.role === 'National Leader';
    const canSecede = isAffiliationLeader && roleInfo.role !== 'National Leader' && roleInfo.role !== 'National Deputy Leader';
    
    const playerPartyId = affiliationToPartyMap.get(player.affiliationId);
    const isInAlliance = useMemo(() => {
        return playerPartyId ? alliances.some(a => a.memberPartyIds.includes(playerPartyId)) : false;
    }, [alliances, playerPartyId]);

    const isGovernmentLeader = government && (
        government.chiefMinisterId === player.id || 
        government.cabinet.some(m => m.ministerId === player.id && (m.portfolio === 'Home Affairs' || m.portfolio === 'Defence'))
    );

    // Restriction: Major political moves are blocked within 30 days of an election
    const isPoliticalStabilityPeriod = daysUntilElection <= 30;
    const restrictionTooltip = isPoliticalStabilityPeriod ? "Cannot perform this action close to an election." : "";

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-[3000] flex items-center justify-center font-sans p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-3">
                    <h2 className="text-2xl font-bold">Character Actions</h2>
                    <button onClick={onClose} className="text-3xl hover:text-red-500">&times;</button>
                </div>

                <div className="space-y-4">
                     <p className="text-sm text-gray-400 -mt-2">Choose an action to perform. Each action takes one day.</p>
                    <div>
                        <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-1 mb-2">General Actions</h3>
                        <div className="space-y-2">
                            <button onClick={() => onPerformAction('promoteParty')} className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors">
                                <h3 className="font-semibold">Promote Party</h3>
                                <p className="text-xs text-gray-300">Give a speech praising your party to increase your influence (+5) and recognition (+2).</p>
                            </button>

                            <button onClick={() => onPerformAction('addressLocal')} className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors">
                                <h3 className="font-semibold">Address Local Concerns</h3>
                                <p className="text-xs text-gray-300">Focus on local issues to significantly boost your influence (+8) and recognition (+4).</p>
                            </button>
                        </div>
                    </div>
                    
                    {(isStateLeader || isStateExecutive) && (
                        <div>
                            <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-1 mb-2">Executive Actions</h3>
                            <div className="space-y-2">
                                <button onClick={() => onPerformAction('strengthenLocalBranch')} className="w-full text-left p-3 bg-gray-700 hover:bg-purple-600 rounded-lg transition-colors">
                                    <h3 className="font-semibold">Strengthen Local Branch</h3>
                                    <p className="text-xs text-gray-300">Bolster party machinery. Boosts your influence (+5) and that of local party members (+2).</p>
                                </button>
                                {isStateLeader && (
                                    <button onClick={() => onPerformAction('organizeStateRally')} className="w-full text-left p-3 bg-gray-700 hover:bg-amber-600 rounded-lg transition-colors">
                                        <h3 className="font-semibold">Organize State Rally</h3>
                                        <p className="text-xs text-gray-300">Hold a major rally. Greatly boosts your influence (+10) and recognition (+5), and aids local party members (+3).</p>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {isGovernmentLeader && (
                        <div>
                             <h3 className="font-semibold text-red-300 border-b border-gray-700 pb-1 mb-2">Government Operations</h3>
                             <div className="space-y-2">
                                <button 
                                    onClick={() => onPerformAction('securityCrackdown')} 
                                    className="w-full text-left p-3 bg-gray-900 border border-red-900 hover:bg-red-900/50 rounded-lg transition-colors group"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-red-400 group-hover:text-red-200">Internal Security Crackdown</h3>
                                        <span className="text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded uppercase font-bold">High Stakes</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Utilize the Internal Security Act to detain a prominent opposition leader. 
                                        <br/><span className="text-red-500 font-bold">Warning:</span> May cause severe public backlash.
                                    </p>
                                </button>
                             </div>
                        </div>
                    )}

                    {isPartyLeader && (
                        <div>
                            <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-1 mb-2">Party Leader Actions</h3>
                            <div className="space-y-2 relative group">
                                <button 
                                    onClick={() => onPerformAction('negotiatePartyMerger', { mode: 'merge' })} 
                                    disabled={isPoliticalStabilityPeriod}
                                    className="w-full text-left p-3 bg-gray-700 hover:bg-teal-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                                >
                                    <h3 className="font-semibold">Negotiate Merger</h3>
                                    <p className="text-xs text-gray-300">Merge with other parties to create a new political entity.</p>
                                </button>
                                <button 
                                    onClick={() => onPerformAction('inviteToParty', { mode: 'absorb' })} 
                                    disabled={isPoliticalStabilityPeriod}
                                    className="w-full text-left p-3 bg-gray-700 hover:bg-cyan-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                                >
                                    <h3 className="font-semibold">Invite to Party</h3>
                                    <p className="text-xs text-gray-300">Invite other parties or factions to be absorbed into your party.</p>
                                </button>
                                {!isInAlliance && (
                                    <button 
                                        onClick={() => onPerformAction('createAlliance')} 
                                        disabled={isPoliticalStabilityPeriod}
                                        className="w-full text-left p-3 bg-gray-700 hover:bg-indigo-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                                    >
                                        <h3 className="font-semibold">Form Political Alliance</h3>
                                        <p className="text-xs text-gray-300">Invite other parties to form a coalition.</p>
                                    </button>
                                )}
                                {isPoliticalStabilityPeriod && (
                                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                                        {restrictionTooltip}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {canSecede && (
                        <div>
                            <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-1 mb-2">Affiliation Leader Actions</h3>
                            <div className="space-y-2">
                                <div className="relative group">
                                    <button 
                                        onClick={() => onPerformAction('secedeJoinParty')} 
                                        disabled={isPoliticalStabilityPeriod}
                                        className="w-full text-left p-3 bg-gray-700 hover:bg-yellow-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                                    >
                                        <h3 className="font-semibold">Lead Faction to Join Party</h3>
                                        <p className="text-xs text-gray-300">Lead your entire affiliation out of your current party and merge with a rival.</p>
                                    </button>
                                    {isPoliticalStabilityPeriod && (
                                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                                            {restrictionTooltip}
                                        </div>
                                    )}
                                </div>
                                <div className="relative group">
                                    <button 
                                        onClick={() => onPerformAction('secedeNewParty')} 
                                        disabled={isPoliticalStabilityPeriod}
                                        className="w-full text-left p-3 bg-gray-700 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                                    >
                                        <h3 className="font-semibold">Lead Faction to Form New Party</h3>
                                        <p className="text-xs text-gray-300">Break away with your affiliation to create a new political party under your leadership.</p>
                                    </button>
                                    {isPoliticalStabilityPeriod && (
                                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                                            {restrictionTooltip}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {rivalPartiesInSeat.length > 0 && (
                         <div>
                            <h3 className="font-semibold border-b border-gray-700 pb-1 mb-2 text-gray-300">Rival Actions</h3>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 mt-2">
                            {rivalPartiesInSeat.map(rivalParty => (
                                <button key={rivalParty.id} onClick={() => onPerformAction('undermineRival', { partyId: rivalParty.id })} className="w-full text-left p-3 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors">
                                    <p className="font-semibold">Criticize {rivalParty.name}</p>
                                    <p className="text-xs text-gray-300">Attempt to lower their influence in this constituency.</p>
                                </button>
                            ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CharacterActionScreen;
