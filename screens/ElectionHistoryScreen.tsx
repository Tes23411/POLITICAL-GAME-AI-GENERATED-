
import React, { useState, useMemo } from 'react';
import { ElectionHistoryEntry, Party } from '../types';
import ElectionResultsPanel from '../components/ElectionResultsPanel';

interface ElectionHistoryScreenProps {
  history: ElectionHistoryEntry[];
  partiesMap: Map<string, Party>;
  totalSeats: number;
  onClose: () => void;
  electionHistory: ElectionHistoryEntry[];
}

const ElectionHistoryScreen: React.FC<ElectionHistoryScreenProps> = ({ history, partiesMap, totalSeats, onClose, electionHistory }) => {
  const [selectedElectionIndex, setSelectedElectionIndex] = useState<number | null>(null);

  const { selectedElection, previousElection } = useMemo(() => {
    if (selectedElectionIndex === null) {
      return { selectedElection: null, previousElection: null };
    }
    const selected = history[selectedElectionIndex];
    const previous = selectedElectionIndex > 0 ? history[selectedElectionIndex - 1] : null;
    return { selectedElection: selected, previousElection: previous };
  }, [selectedElectionIndex, history]);
  
  const historicalPartiesMap = useMemo(() => {
      // Start with a base of current live parties as a fallback.
      const map = new Map<string, Party>(partiesMap);
      
      // Overlay previous election parties if available (for swing calc context)
      if (previousElection && previousElection.parties) {
           previousElection.parties.forEach(p => map.set(p.id, p));
      }
  
      // Overlay selected election parties (highest priority) to ensure accurate historical names/colors
      if (selectedElection && selectedElection.parties) {
          selectedElection.parties.forEach(p => map.set(p.id, p));
      }
      
      return map;
  }, [selectedElection, previousElection, partiesMap]);

  if (selectedElection) {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-75 z-[5000] flex items-center justify-center font-sans p-4">
        <div className="relative w-full h-full max-w-5xl max-h-[95vh]">
           <ElectionResultsPanel
              results={selectedElection.results}
              previousResults={previousElection ? previousElection.results : new Map()}
              detailedResults={selectedElection.detailedResults}
              previousDetailedResults={previousElection ? previousElection.detailedResults : null}
              partiesMap={historicalPartiesMap}
              totalSeats={selectedElection.totalSeats}
              onClose={() => setSelectedElectionIndex(null)}
              electionDate={selectedElection.date}
              totalElectorate={selectedElection.totalElectorate}
              alliances={selectedElection.alliances || []}
            />
             <button
              onClick={() => setSelectedElectionIndex(null)}
              className="absolute top-2 left-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg text-sm z-10"
            >
              &larr; Back to List
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 z-[5000] flex items-center justify-center font-sans p-4">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-center">Election History</h2>
          <button onClick={onClose} className="text-3xl hover:text-red-500">&times;</button>
        </div>
        <p className="text-gray-400 mb-6">Select an election year to view detailed results.</p>
        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
          {history.length > 0 ? (
            [...history].reverse().map((entry, index) => {
              const reversedIndex = history.length - 1 - index;
              return (
              <button
                key={entry.date.toISOString()}
                onClick={() => setSelectedElectionIndex(reversedIndex)}
                className="w-full text-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold text-lg"
              >
                {entry.date.getFullYear()} General Election
              </button>
            )})
          ) : (
            <p className="text-center text-gray-500">No election history available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionHistoryScreen;
