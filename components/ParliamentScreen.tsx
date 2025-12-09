
import React, { useMemo } from 'react';
import { Party, ElectionResults, Character, GameState, Bill, BillVoteTally, BillVoteBreakdown, VoteDirection } from '../types';
import { getPartySeatCounts } from '../utils/politics';
import BillProposalPanel from '../components/BillProposalPanel';
import BillResultsPanel from '../components/BillResultsPanel';


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
}

const ParliamentScreen: React.FC<ParliamentScreenProps> = ({ gameState, electionResults, partiesMap, totalSeats, speaker, onClose, currentBill, playerParty, billVoteResults, onVoteOnBill, onCloseBillResults }) => {
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
    
    const governmentParty = seatDistribution.length > 0 ? partiesMap.get(seatDistribution[0].partyId) : null;

    // Horseshoe layout constants
    const width = 350; // Reduced width
    const height = 220; // Reduced height
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
        <div className="h-full w-[450px] flex-shrink-0 bg-gray-800 text-white p-6 shadow-lg overflow-y-auto font-sans">
            <div className="w-full relative">
                <button onClick={onClose} className="absolute top-0 right-0 text-3xl hover:text-red-500 z-10">&times;</button>
                <h1 className="text-3xl font-bold text-left mb-4">Parliament</h1>
                
                <div className="relative mx-auto" style={{ width, height }}>
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
                        const y = height - 20 + layer.radiusY * Math.sin(radian);

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
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-center">
                         <div className="w-16 h-10 bg-yellow-900 border-2 border-yellow-700 rounded-t-md flex items-center justify-center">
                           <span className="text-xs text-yellow-300">Speaker</span>
                        </div>
                         <p className="text-sm mt-1">{speaker?.name || 'Not Elected'}</p>
                    </div>
                </div>
                
                <div className="mt-32 flex justify-start flex-wrap gap-x-4 gap-y-2">
                     {(Array.from(partiesMap.values()) as Party[]).filter(p => seatDistribution.some(s => s.partyId === p.id)).map(party => (
                        <div key={party.id} className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-sm" style={{backgroundColor: party.color}}></div>
                            <span className="text-sm">{party.name}: {seatDistribution.filter(s => s.partyId === party.id).length}</span>
                        </div>
                     ))}
                </div>
                 <p className="text-left mt-4 text-gray-400 text-sm">
                    {governmentParty ? `Government formed by ${governmentParty.name}.` : 'No clear majority.'}
                </p>

                 {/* Overlays for bill voting and results */}
                {gameState === 'bill-proposal' && currentBill && playerParty && (
                    <BillProposalPanel 
                        bill={currentBill}
                        playerParty={playerParty}
                        partiesMap={partiesMap}
                        electionResults={electionResults}
                        onVote={onVoteOnBill}
                    />
                )}
                {gameState === 'bill-results' && billVoteResults && currentBill && (
                     <BillResultsPanel 
                        bill={currentBill}
                        results={billVoteResults}
                        partiesMap={partiesMap}
                        onClose={onCloseBillResults}
                     />
                )}
            </div>
        </div>
    );
};

export default ParliamentScreen;