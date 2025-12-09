
import React, { useMemo, useState } from 'react';
import { Party, ElectionResults, Character, GameState, Bill, BillVoteTally, BillVoteBreakdown, VoteDirection, Government } from '../types';
import { getPartySeatCounts } from '../utils/politics';

interface ParliamentScreenProps {
    gameState: GameState;
    electionResults: ElectionResults;
    partiesMap: Map<string, Party>;
    totalSeats: number;
    speaker: Character | null;
    onClose: () => void;
    // Bill related props
    currentBill: Bill | null;
    playerParty: Party | null;
    billVoteResults: { passed: boolean; tally: BillVoteTally; breakdown: BillVoteBreakdown; } | null;
    onVoteOnBill: (vote: VoteDirection) => void;
    onCloseBillResults: () => void;
    government: Government | null;
    characters: Character[];
    onCallVoteOfConfidence: () => void;
    onProposeBill: () => void;
}

const ParliamentScreen: React.FC<ParliamentScreenProps> = ({ 
    gameState, electionResults, partiesMap, totalSeats, speaker, onClose, 
    currentBill, playerParty, billVoteResults, onVoteOnBill, onCloseBillResults,
    government, characters, onCallVoteOfConfidence, onProposeBill
}) => {
    const [activeTab, setActiveTab] = useState<'seating' | 'government'>('seating');

    const seatDistribution = useMemo(() => {
        const partySeatCounts = getPartySeatCounts(electionResults, partiesMap);
        const sortedParties = Array.from(partySeatCounts.entries())
            .sort((a, b) => b[1] - a[1]);

        let seats: { partyId: string, color: string }[] = [];
        sortedParties.forEach(([partyId, count]) => {
            const party = partiesMap.get(partyId);
            if (party && count > 0) {
                seats = seats.concat(Array(count).fill({ partyId, color: party.color }));
            }
        });
        return seats;
    }, [electionResults, partiesMap]);
    
    const rulingCoalitionIds = government?.rulingCoalitionIds || [];
    const governmentParties = rulingCoalitionIds.map(id => partiesMap.get(id)).filter(Boolean) as Party[];
    
    const chiefMinister = government ? characters.find(c => c.id === government.chiefMinisterId) : null;

    // Horseshoe layout constants
    const width = 350; // Reduced width
    const height = 350; // Increased height to prevent overlap with bottom content
    const seatSize = 5; // Reduced size

    // Define the 4 layers, from innermost to outermost
    const LAYERS = [
        { radiusX: 80, radiusY: 50 },
        { radiusX: 105, radiusY: 70 },
        { radiusX: 130, radiusY: 90 },
        { radiusX: 155, radiusY: 110 }
    ];
    
    // Calculate how many seats are in each layer to properly space them
    const seatsPerLayer = [0, 0, 0, 0];
    if (seatDistribution.length > 0) {
        seatDistribution.forEach((_, index) => {
            seatsPerLayer[index % LAYERS.length]++;
        });
    }

    return (
        <div className="h-full w-[450px] flex-shrink-0 bg-gray-800 text-white p-6 shadow-lg overflow-y-auto font-sans border-r border-gray-700">
            <div className="w-full relative h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                     <h1 className="text-3xl font-bold text-left">Parliament</h1>
                     <div className="flex gap-2">
                        {playerParty && (
                            <button 
                                onClick={onProposeBill}
                                className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs font-bold border border-blue-500 transition-colors"
                                title="Draft a new bill"
                            >
                                Draft Bill
                            </button>
                        )}
                        <button onClick={onClose} className="text-3xl hover:text-red-500 leading-none">&times;</button>
                     </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-600 mb-4">
                    <button 
                        className={`flex-1 pb-2 text-sm font-bold ${activeTab === 'seating' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('seating')}
                    >
                        Chamber
                    </button>
                    <button 
                         className={`flex-1 pb-2 text-sm font-bold ${activeTab === 'government' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setActiveTab('government')}
                    >
                        Government
                    </button>
                </div>
                
                {activeTab === 'seating' && (
                    <>
                        <div className="relative mx-auto mb-6" style={{ width, height: 250 }}> {/* Explicit container height lower than calc height to push content down */}
                            {seatDistribution.map((seat, index) => {
                                const layerIndex = index % LAYERS.length;
                                const seatIndexInLayer = Math.floor(index / LAYERS.length);
                                const numSeatsInThisLayer = seatsPerLayer[layerIndex];
                                const layer = LAYERS[layerIndex];
                                
                                let angle = 90; // Default for a single seat in a layer, places it at the bottom center
                                if (numSeatsInThisLayer > 1) {
                                   angle = 190 - (seatIndexInLayer / (numSeatsInThisLayer - 1)) * 200;
                                }

                                const radian = angle * Math.PI / 180;
                                const x = width / 2 + layer.radiusX * Math.cos(radian);
                                const y = height - 150 + layer.radiusY * Math.sin(radian); // Adjusted Y center

                                return (
                                    <div
                                        key={index}
                                        className="absolute rounded-sm"
                                        style={{
                                            left: `${x - seatSize / 2}px`,
                                            top: `${y - seatSize / 2}px`,
                                            width: `${seatSize}px`,
                                            height: `${seatSize}px`,
                                            backgroundColor: seat.color,
                                            transform: `rotate(${angle + 90}deg)`,
                                            border: '1px solid #1a202c',
                                        }}
                                        title={partiesMap.get(seat.partyId)?.name}
                                    />
                                );
                            })}
                            <div className="absolute top-[200px] left-1/2 -translate-x-1/2 text-center">
                                 <div className="w-16 h-10 bg-yellow-900 border-2 border-yellow-700 rounded-t-md flex items-center justify-center">
                                   <span className="text-xs text-yellow-300 font-bold">Speaker</span>
                                </div>
                                 <p className="text-xs mt-1 text-gray-300">{speaker?.name || 'Vacant'}</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-start flex-wrap gap-x-4 gap-y-2 mb-4">
                             {(Array.from(partiesMap.values()) as Party[]).filter(p => seatDistribution.some(s => s.partyId === p.id)).map(party => (
                                <div key={party.id} className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-sm" style={{backgroundColor: party.color}}></div>
                                    <span className="text-xs font-medium">{party.name}: <span className="text-gray-300">{seatDistribution.filter(s => s.partyId === party.id).length}</span></span>
                                </div>
                             ))}
                        </div>
                        
                        <div className="bg-gray-700/50 p-3 rounded-lg mb-4 mt-4">
                             <h3 className="text-sm font-bold text-gray-300 mb-1">Government Status</h3>
                             {rulingCoalitionIds.length > 0 ? (
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-gray-400">Ruling Coalition:</span>
                                        <div className="flex -space-x-1">
                                            {governmentParties.map(p => (
                                                <div key={p.id} className="w-3 h-3 rounded-full border border-gray-800" style={{backgroundColor: p.color}} title={p.name}></div>
                                            ))}
                                        </div>
                                     </div>
                                     <p className="text-sm"><strong>Chief Minister:</strong> {chiefMinister?.name || 'None'}</p>
                                 </div>
                             ) : (
                                 <p className="text-sm text-yellow-500 italic">No government formed.</p>
                             )}
                        </div>
                        
                        {government && (
                             <button 
                                onClick={onCallVoteOfConfidence}
                                className="w-full py-2 bg-red-900/80 hover:bg-red-800 border border-red-700 rounded text-red-100 text-sm font-bold transition-colors"
                            >
                                Call Vote of Confidence
                            </button>
                        )}
                    </>
                )}

                {activeTab === 'government' && government && (
                    <div className="flex-grow overflow-y-auto pr-1 animate-fadeIn">
                        <div className="mb-6 text-center">
                             <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center border-2 border-amber-500">
                                 <span className="text-2xl font-bold text-gray-300">{chiefMinister?.name.charAt(0)}</span>
                             </div>
                             <h3 className="text-xl font-bold text-white">{chiefMinister?.name}</h3>
                             <p className="text-amber-400 font-bold text-sm">Chief Minister</p>
                        </div>
                        
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-600 pb-1 mb-3">The Cabinet</h3>
                        <div className="space-y-3">
                            {government.cabinet.map((minister, idx) => {
                                const char = characters.find(c => c.id === minister.ministerId);
                                const partyId = rulingCoalitionIds.find(pid => partiesMap.get(pid)?.affiliationIds.includes(char?.affiliationId || ''));
                                const party = partyId ? partiesMap.get(partyId) : null;
                                
                                if (!char) return null;

                                return (
                                    <div key={idx} className="bg-gray-700/40 p-3 rounded-lg flex justify-between items-center border border-gray-700">
                                        <div>
                                            <p className="text-xs text-blue-300 font-bold uppercase mb-0.5">{minister.portfolio}</p>
                                            <p className="font-semibold text-white">{char.name}</p>
                                        </div>
                                        {party && (
                                            <div className="text-right">
                                                <div className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-600" style={{ borderColor: party.color, color: party.color }}>
                                                    {party.name}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                 {activeTab === 'government' && !government && (
                     <div className="flex items-center justify-center h-64">
                         <p className="text-gray-500 italic">Government has not been formed yet.</p>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default ParliamentScreen;
