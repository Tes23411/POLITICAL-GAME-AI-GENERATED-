
import React, { useMemo } from 'react';
import { Demographics } from '../types';

interface CountryInfoPanelProps {
  demographicsMap: Map<string, Demographics>;
  onClose: () => void;
}

const ProgressBarSegment = ({ value, color, label }: { value: number, color: string, label?: string }) => {
    if (value <= 0) return null;
    return (
        <div 
            className="h-full flex items-center justify-center text-[10px] font-bold text-black/70 overflow-hidden first:rounded-l-full last:rounded-r-full" 
            style={{ width: `${value}%`, backgroundColor: color }}
            title={label}
        >
           {value > 5 && `${value.toFixed(1)}%`}
        </div>
    );
};

const CountryInfoPanel: React.FC<CountryInfoPanelProps> = ({ demographicsMap, onClose }) => {
    
    const stats = useMemo(() => {
        const stateStats = new Map<string, { total: number, malay: number, chinese: number, indian: number, others: number }>();
        const national = { total: 0, malay: 0, chinese: 0, indian: 0, others: 0 };

        demographicsMap.forEach((demo) => {
            // Clean state name just in case
            const state = demo.state.trim().toUpperCase();
            
            // Calculate absolute numbers for this seat
            const pop = demo.totalElectorate;
            const malay = Math.round(pop * (demo.malayPercent / 100));
            const chinese = Math.round(pop * (demo.chinesePercent / 100));
            const indian = Math.round(pop * (demo.indianPercent / 100));
            // Others is remainder to ensure total matches or calc from percent
            const others = Math.round(pop * (demo.othersPercent / 100));

            // Accumulate National
            national.total += pop;
            national.malay += malay;
            national.chinese += chinese;
            national.indian += indian;
            national.others += others;

            // Accumulate State
            if (!stateStats.has(state)) {
                stateStats.set(state, { total: 0, malay: 0, chinese: 0, indian: 0, others: 0 });
            }
            const s = stateStats.get(state)!;
            s.total += pop;
            s.malay += malay;
            s.chinese += chinese;
            s.indian += indian;
            s.others += others;
        });

        // Convert state map to array and sort by total population
        const stateList = Array.from(stateStats.entries()).map(([name, data]) => ({
            name,
            ...data,
            malayPercent: (data.malay / data.total) * 100,
            chinesePercent: (data.chinese / data.total) * 100,
            indianPercent: (data.indian / data.total) * 100,
            othersPercent: (data.others / data.total) * 100,
        })).sort((a,b) => b.total - a.total);

        // National Percentages
        const nationalPercents = {
            malay: (national.malay / national.total) * 100,
            chinese: (national.chinese / national.total) * 100,
            indian: (national.indian / national.total) * 100,
            others: (national.others / national.total) * 100
        };

        return { national, nationalPercents, stateList };
    }, [demographicsMap]);

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-[6000] flex items-center justify-center font-sans p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-600">
                <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-3">
                    <h2 className="text-3xl font-bold text-amber-400">Demographics Data</h2>
                    <button onClick={onClose} className="text-3xl hover:text-red-500">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-8">
                    
                    {/* National Overview */}
                    <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600">
                        <h3 className="text-xl font-bold mb-4 flex justify-between items-end">
                            <span>Federation of Malaya</span>
                            <span className="text-2xl font-mono text-green-400">{stats.national.total.toLocaleString()} <span className="text-sm text-gray-400">Total Electorate</span></span>
                        </h3>
                        
                        {/* Big Progress Bar */}
                        <div className="h-8 w-full flex rounded-full overflow-hidden bg-gray-900 mb-4 shadow-inner">
                            <ProgressBarSegment value={stats.nationalPercents.malay} color="#ffe119" label="Malay" />
                            <ProgressBarSegment value={stats.nationalPercents.chinese} color="#e6194B" label="Chinese" />
                            <ProgressBarSegment value={stats.nationalPercents.indian} color="#f58231" label="Indian" />
                            <ProgressBarSegment value={stats.nationalPercents.others} color="#a9a9a9" label="Others" />
                        </div>

                        {/* Legend / Key Stats */}
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-800/80 p-2 rounded border-b-4 border-[#ffe119]">
                                <div className="text-gray-400 text-xs uppercase">Malay</div>
                                <div className="font-bold text-lg">{stats.nationalPercents.malay.toFixed(1)}%</div>
                                <div className="text-xs text-gray-500">{stats.national.malay.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-800/80 p-2 rounded border-b-4 border-[#e6194B]">
                                <div className="text-gray-400 text-xs uppercase">Chinese</div>
                                <div className="font-bold text-lg">{stats.nationalPercents.chinese.toFixed(1)}%</div>
                                <div className="text-xs text-gray-500">{stats.national.chinese.toLocaleString()}</div>
                            </div>
                             <div className="bg-gray-800/80 p-2 rounded border-b-4 border-[#f58231]">
                                <div className="text-gray-400 text-xs uppercase">Indian</div>
                                <div className="font-bold text-lg">{stats.nationalPercents.indian.toFixed(1)}%</div>
                                <div className="text-xs text-gray-500">{stats.national.indian.toLocaleString()}</div>
                            </div>
                             <div className="bg-gray-800/80 p-2 rounded border-b-4 border-[#a9a9a9]">
                                <div className="text-gray-400 text-xs uppercase">Others</div>
                                <div className="font-bold text-lg">{stats.nationalPercents.others.toFixed(1)}%</div>
                                <div className="text-xs text-gray-500">{stats.national.others.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* State Breakdown */}
                    <div>
                        <h3 className="text-lg font-bold mb-3 text-gray-300">State Breakdown</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {stats.stateList.map(state => (
                                <div key={state.name} className="bg-gray-700/30 p-3 rounded-lg flex flex-col md:flex-row items-center gap-4 hover:bg-gray-700/50 transition-colors">
                                    <div className="w-full md:w-1/4">
                                        <div className="font-bold text-base">{state.name}</div>
                                        <div className="text-xs text-gray-400">{state.total.toLocaleString()} voters</div>
                                    </div>
                                    <div className="w-full md:w-3/4 flex flex-col gap-1">
                                         <div className="h-4 w-full flex rounded-full overflow-hidden bg-gray-900">
                                            <div style={{ width: `${state.malayPercent}%`, backgroundColor: '#ffe119' }} title={`Malay: ${state.malayPercent.toFixed(1)}%`}></div>
                                            <div style={{ width: `${state.chinesePercent}%`, backgroundColor: '#e6194B' }} title={`Chinese: ${state.chinesePercent.toFixed(1)}%`}></div>
                                            <div style={{ width: `${state.indianPercent}%`, backgroundColor: '#f58231' }} title={`Indian: ${state.indianPercent.toFixed(1)}%`}></div>
                                            <div style={{ width: `${state.othersPercent}%`, backgroundColor: '#a9a9a9' }} title={`Others: ${state.othersPercent.toFixed(1)}%`}></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-400 px-1">
                                            <span>M: {state.malayPercent.toFixed(0)}%</span>
                                            <span>C: {state.chinesePercent.toFixed(0)}%</span>
                                            <span>I: {state.indianPercent.toFixed(0)}%</span>
                                            <span>O: {state.othersPercent.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CountryInfoPanel;
