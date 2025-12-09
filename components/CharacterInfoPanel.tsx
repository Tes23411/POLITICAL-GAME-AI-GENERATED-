
import React, { useState } from 'react';
import { CharacterInfoPanelProps } from '../types';
import { getIdeologyName } from '../utils/politics';

const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs font-medium mb-1 text-gray-300">
      <span>{label}</span>
      <span>{value}/100</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full shadow-sm ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, transition: 'width 0.5s ease-in-out' }}
      ></div>
    </div>
  </div>
);

const CharacterInfoPanel: React.FC<CharacterInfoPanelProps> = (props) => {
    const {
        character,
        affiliation,
        party,
        seat,
        onClose,
        currentDate,
        roleInfo,
        isPlayerMoving,
        onInitiateMove,
        onCancelMove,
        onOpenPartyManagement,
        onOpenActions,
        onOpenAffiliationManagement,
        isPartyManagementDisabled,
        partyManagementTooltip,
        isAffiliationManagementDisabled,
        affiliationManagementTooltip,
        government
    } = props;

    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

    const age = Math.floor((currentDate.getTime() - new Date(character.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    const partyColor = party?.color || '#4b5563'; 

    const ministerRole = government?.cabinet.find(m => m.ministerId === character.id);
    const isCM = government?.chiefMinisterId === character.id;

    const ideologyName = getIdeologyName(character.ideology);

    return (
        <div className="absolute bottom-4 left-4 w-96 bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden border border-gray-700 font-sans flex flex-col z-[1500] max-h-[85vh] transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="relative h-28 transition-colors duration-500" style={{ background: `linear-gradient(160deg, ${partyColor}, #111827)` }}>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors z-20"
                >
                    &times;
                </button>
                <div className="absolute -bottom-10 left-6 flex items-end">
                    <div className="w-20 h-20 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center text-3xl font-bold shadow-lg text-gray-300 relative z-10">
                        {character.name.charAt(0)}
                        {character.isPlayer && (
                            <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-gray-800 rounded-full" title="Player Character"></span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-12 px-6 pb-4 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {/* Identity */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold leading-tight mb-1">{character.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-medium">
                        <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700">{age} yrs</span>
                        <span className={`px-2 py-0.5 rounded border ${character.isAlive ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
                            {character.isAlive ? 'Alive' : 'Deceased'}
                        </span>
                        <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700">{character.ethnicity}</span>
                        <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700">{character.state}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-5">
                    <button 
                        className={`flex-1 pb-3 text-sm font-medium transition-all relative ${activeTab === 'overview' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                        {activeTab === 'overview' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></span>}
                    </button>
                    <button 
                        className={`flex-1 pb-3 text-sm font-medium transition-all relative ${activeTab === 'history' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Career
                        {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></span>}
                    </button>
                </div>

                {/* Tab Panels */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Political Standing */}
                        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Political Standing</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Political Party</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: partyColor }}></div>
                                        <span className="font-semibold text-sm">{party?.name || 'Independent'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">Constituency</p>
                                        <p className="font-medium text-sm">{seat?.properties.PARLIMEN || 'None'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">Affiliation</p>
                                        <p className="font-medium text-sm">{affiliation?.name || 'None'}</p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-700/50">
                                    <p className="text-xs text-gray-400 mb-1">Current Roles</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-200 border border-gray-600">
                                            {roleInfo.details}
                                        </span>
                                        {isCM && (
                                             <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-900/40 text-amber-300 border border-amber-600/50 shadow-sm">
                                                Chief Minister
                                            </span>
                                        )}
                                        {ministerRole && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-900/40 text-indigo-300 border border-indigo-600/50 shadow-sm">
                                                Minister of {ministerRole.portfolio}
                                            </span>
                                        )}
                                        {character.isAffiliationLeader && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-700/50">
                                                Faction Leader
                                            </span>
                                        )}
                                        {character.isMP && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50">
                                                Member of Parliament
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ideology Mini View */}
                        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ideology</h3>
                                <span className="text-xs font-bold text-amber-400">{ideologyName}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Economic:</span>
                                <span className="font-mono text-blue-300">{Math.round(character.ideology.economic)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
                                <div className="h-1.5 rounded-full bg-blue-500" style={{width: `${character.ideology.economic}%`}}></div>
                            </div>
                             <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Governance:</span>
                                <span className="font-mono text-purple-300">{Math.round(character.ideology.governance)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-purple-500" style={{width: `${character.ideology.governance}%`}}></div>
                            </div>
                        </div>

                        {/* Stats */}
                        {character.isAlive && (
                             <div>
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Capabilities</h3>
                                <StatBar label="Influence" value={character.influence} color="bg-blue-500" />
                                <StatBar label="Charisma" value={character.charisma} color="bg-purple-500" />
                                <StatBar label="Recognition" value={character.recognition} color="bg-teal-500" />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                     <div className="animate-fadeIn">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">Timeline of Events</h3>
                        <div className="relative border-l-2 border-gray-800 ml-2 space-y-6 pb-2">
                            {[...character.history].reverse().map((entry, idx) => (
                                <div key={idx} className="ml-5 relative group">
                                    <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 bg-gray-700 rounded-full border-2 border-gray-900 group-hover:bg-blue-500 group-hover:border-gray-800 transition-colors"></div>
                                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
                                        <p className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-wide">{entry.date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-sm text-gray-300 leading-snug">{entry.event}</p>
                                    </div>
                                </div>
                            ))}
                            {character.history.length === 0 && (
                                <div className="ml-5 text-sm text-gray-500 italic py-4">No history recorded yet.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Player Actions Footer */}
            {character.isPlayer && character.isAlive && (
                 <div className="p-4 bg-gray-800 border-t border-gray-700">
                    {!isPlayerMoving ? (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                 <button
                                    onClick={onInitiateMove}
                                    className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 hover:text-white text-gray-200 text-xs font-bold rounded-lg transition-all border border-gray-600 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    Move Seat
                                </button>
                                <button
                                    onClick={onOpenActions}
                                    className="px-3 py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    Perform Action
                                </button>
                            </div>
                            
                             {(character.isAffiliationLeader || roleInfo.role === 'National Leader') && (
                                 <div className="grid grid-cols-1 gap-2 pt-1">
                                    {character.isAffiliationLeader && (
                                         <div className="relative group w-full">
                                             <button
                                                onClick={onOpenAffiliationManagement}
                                                disabled={isAffiliationManagementDisabled}
                                                className="w-full px-3 py-2 bg-teal-700/80 hover:bg-teal-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 text-teal-100 text-xs font-bold rounded-lg transition-colors border border-teal-600/50 flex items-center justify-center gap-2"
                                             >
                                                 Manage Faction Candidates
                                             </button>
                                             {isAffiliationManagementDisabled && (
                                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity w-48 text-center pointer-events-none z-50 shadow-lg border border-gray-700">
                                                     {affiliationManagementTooltip}
                                                     <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45 border-b border-r border-gray-700"></div>
                                                 </div>
                                             )}
                                         </div>
                                    )}

                                    {roleInfo.role === 'National Leader' && (
                                         <div className="relative group w-full">
                                             <button
                                                onClick={onOpenPartyManagement}
                                                disabled={isPartyManagementDisabled}
                                                className="w-full px-3 py-2 bg-indigo-700/80 hover:bg-indigo-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-700 text-indigo-100 text-xs font-bold rounded-lg transition-colors border border-indigo-600/50 flex items-center justify-center gap-2"
                                             >
                                                 Manage Party Strategy
                                             </button>
                                             {isPartyManagementDisabled && (
                                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity w-48 text-center pointer-events-none z-50 shadow-lg border border-gray-700">
                                                     {partyManagementTooltip}
                                                     <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45 border-b border-r border-gray-700"></div>
                                                 </div>
                                             )}
                                         </div>
                                     )}
                                </div>
                             )}
                        </div>
                    ) : (
                        <div className="text-center py-2">
                             <p className="text-amber-400 text-xs mb-3 font-semibold animate-pulse">Select a constituency on the map...</p>
                             <button
                                onClick={onCancelMove}
                                className="w-full px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors shadow-lg"
                            >
                                Cancel Move
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CharacterInfoPanel;
