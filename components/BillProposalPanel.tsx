
import React, { useMemo } from 'react';
import { Bill, Party, VoteDirection, ElectionResults } from '../types';
import { aiDecideBillVote, getPartySeatCounts } from '../utils/politics';

interface BillProposalPanelProps {
    bill: Bill;
    playerParty: Party;
    partiesMap: Map<string, Party>;
    electionResults: ElectionResults;
    onVote: (vote: VoteDirection) => void;
}

const BillProposalPanel: React.FC<BillProposalPanelProps> = ({ bill, playerParty, partiesMap, electionResults, onVote }) => {
    
    const partySeatCounts = useMemo(() => getPartySeatCounts(electionResults, partiesMap), [electionResults, partiesMap]);
    const playerVotes = partySeatCounts.get(playerParty.id) || 0;
    const totalSeats = Array.from(partySeatCounts.values()).reduce((a,b) => a+b, 0);
    const threshold = bill.isConstitutional ? Math.ceil(totalSeats * 2 / 3) : Math.floor(totalSeats / 2) + 1;

    const otherMajorPartiesStances = useMemo(() => {
        return (Array.from(partiesMap.values()) as Party[])
            .filter(p => p.id !== playerParty.id && (partySeatCounts.get(p.id) || 0) > 0)
            .map(p => ({
                party: p,
                stance: aiDecideBillVote(p, bill)
            }))
            .sort((a,b) => (partySeatCounts.get(b.party.id) || 0) - (partySeatCounts.get(a.party.id) || 0))
            .slice(0, 5); // Show top 5 other parties
    }, [partiesMap, playerParty, bill, partySeatCounts]);

    const proposingParty = partiesMap.get(bill.proposingPartyId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[6000] flex items-center justify-center p-4 font-sans">
            <div className="bg-gray-900 text-white p-6 rounded-lg shadow-2xl w-full border border-gray-600 max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-left text-amber-400 leading-tight">
                            Bill Proposal
                        </h2>
                         <p className="text-sm text-left text-gray-400 mt-1">Proposed by: <span style={{color: proposingParty?.color}} className="font-bold">{proposingParty?.name}</span></p>
                    </div>
                    {bill.isConstitutional && (
                        <div className="bg-red-900/80 border border-red-500 text-red-200 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide animate-pulse">
                            Constitutional Amendment
                        </div>
                    )}
                </div>
                
                <div className="bg-gray-800 p-5 rounded-lg mb-6 border border-gray-700 shadow-inner">
                    <h3 className="font-bold text-xl mb-3 text-white">{bill.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{bill.description}</p>
                    
                    <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-700 text-xs">
                        <div className="bg-gray-700 px-2 py-1 rounded">
                            <span className="text-gray-400">Majority Required:</span> <strong className="text-white text-base ml-1">{threshold}</strong> / {totalSeats}
                        </div>
                        <div className="bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                            <span className="text-gray-400">Tags:</span>
                            {bill.tags.map(tag => (
                                <span key={tag} className="bg-gray-600 text-gray-200 px-1.5 rounded capitalize">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div>
                        <h4 className="font-bold mb-3 text-gray-300 border-b border-gray-600 pb-1">Cast Your Vote</h4>
                        <p className="text-sm text-gray-400 mb-4">Your party holds <strong className="text-white text-lg">{playerVotes}</strong> seat(s).</p>
                        <div className="flex flex-col space-y-3">
                             <button onClick={() => onVote('Aye')} className="w-full px-4 py-3 bg-green-700 hover:bg-green-600 font-bold rounded-lg transition-colors flex justify-between items-center border border-green-500 shadow-lg shadow-green-900/30">
                                 <span>Vote Aye</span>
                                 <span className="bg-black/30 px-2 py-0.5 rounded text-sm font-mono">{playerVotes}</span>
                             </button>
                             <button onClick={() => onVote('Nay')} className="w-full px-4 py-3 bg-red-700 hover:bg-red-600 font-bold rounded-lg transition-colors flex justify-between items-center border border-red-500 shadow-lg shadow-red-900/30">
                                 <span>Vote Nay</span>
                                 <span className="bg-black/30 px-2 py-0.5 rounded text-sm font-mono">{playerVotes}</span>
                             </button>
                             <button onClick={() => onVote('Abstain')} className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-500 font-bold rounded-lg transition-colors flex justify-between items-center border border-gray-500">
                                 <span>Abstain</span>
                                 <span className="bg-black/30 px-2 py-0.5 rounded text-sm font-mono">{playerVotes}</span>
                             </button>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold mb-3 text-gray-300 border-b border-gray-600 pb-1">Projected Support</h4>
                         <div className="space-y-2 text-sm bg-gray-800/50 p-3 rounded-lg max-h-60 overflow-y-auto border border-gray-700">
                            {otherMajorPartiesStances.length > 0 ? otherMajorPartiesStances.map(({ party, stance }) => (
                                <div key={party.id} className="flex justify-between items-center bg-gray-700/80 p-2 rounded border-l-4 border-transparent" style={{borderLeftColor: party.color}}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{party.name}</span>
                                        <span className="text-xs text-gray-400">({partySeatCounts.get(party.id)})</span>
                                    </div>
                                    <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                                        stance === 'Aye' ? 'bg-green-900 text-green-300' : 
                                        stance === 'Nay' ? 'bg-red-900 text-red-300' : 
                                        'bg-gray-600 text-gray-300'
                                    }`}>
                                        {stance.toUpperCase()}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center italic py-4">No other major parties.</p>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillProposalPanel;
