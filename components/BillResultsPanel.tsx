
import React, { useMemo } from 'react';
import { Bill, Party, BillVoteTally, BillVoteBreakdown } from '../types';

interface BillResultsPanelProps {
    bill: Bill;
    results: {
        passed: boolean;
        tally: BillVoteTally;
        breakdown: BillVoteBreakdown;
    };
    partiesMap: Map<string, Party>;
    onClose: () => void;
}

const BillResultsPanel: React.FC<BillResultsPanelProps> = ({ bill, results, partiesMap, onClose }) => {
    const { passed, tally, breakdown } = results;

    const votesByStance = useMemo(() => {
        const votes = { Aye: [], Nay: [], Abstain: [] } as Record<string, { name: string, color: string }[]>;
        for (const [partyId, vote] of breakdown.entries()) {
            const party = partiesMap.get(partyId);
            if (party) {
                votes[vote].push({ name: party.name, color: party.color });
            }
        }
        return votes;
    }, [breakdown, partiesMap]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[6000] flex items-center justify-center p-4 font-sans">
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-2xl w-full max-w-3xl border border-gray-600 relative overflow-hidden">
                {/* Background Decor */}
                <div className={`absolute top-0 left-0 w-full h-2 ${passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                
                <div className="mb-6 text-center">
                    <h2 className="text-4xl font-bold mb-1">
                        {passed ? <span className="text-green-400">Bill Passed</span> : <span className="text-red-400">Bill Defeated</span>}
                    </h2>
                    <p className="text-gray-400 text-lg">{bill.title}</p>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center mb-8">
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-green-900/50">
                        <p className="text-5xl font-bold text-green-500 mb-1">{tally.Aye}</p>
                        <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Ayes</p>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-red-900/50">
                        <p className="text-5xl font-bold text-red-500 mb-1">{tally.Nay}</p>
                        <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Nays</p>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                        <p className="text-5xl font-bold text-gray-400 mb-1">{tally.Abstain}</p>
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Abstain</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-sm h-48">
                    <div className="bg-gray-900/50 p-3 rounded border border-gray-700 flex flex-col">
                        <h4 className="font-bold text-green-400 border-b border-green-800 pb-2 mb-2 text-center">Voted Aye</h4>
                        <ul className="space-y-1 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-700">
                            {votesByStance.Aye.map(p => (
                                <li key={p.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></div>
                                    <span>{p.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded border border-gray-700 flex flex-col">
                        <h4 className="font-bold text-red-400 border-b border-red-800 pb-2 mb-2 text-center">Voted Nay</h4>
                        <ul className="space-y-1 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-700">
                            {votesByStance.Nay.map(p => (
                                <li key={p.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></div>
                                    <span>{p.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded border border-gray-700 flex flex-col">
                        <h4 className="font-bold text-gray-400 border-b border-gray-600 pb-2 mb-2 text-center">Abstained</h4>
                        <ul className="space-y-1 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-700">
                            {votesByStance.Abstain.map(p => (
                                <li key={p.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></div>
                                    <span>{p.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-lg transition-all shadow-lg hover:shadow-blue-900/50"
                    >
                        Close Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillResultsPanel;
