
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { LogEntry, LogType } from '../types';

interface EventLogPanelProps {
  logEntries: LogEntry[];
  onClose: () => void;
}

const EventLogPanel: React.FC<EventLogPanelProps> = ({ logEntries, onClose }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'major' | 'politics' | 'death' | 'personal'>('all');

  const filteredLogs = useMemo(() => {
    return logEntries.filter(entry => {
      if (filter === 'all') return true;
      if (filter === 'major') return entry.type === 'major_event';
      if (filter === 'politics') return entry.type === 'politics' || entry.type === 'election' || entry.type === 'event'; 
      if (filter === 'death') return entry.type === 'death';
      if (filter === 'personal') return entry.type === 'personal';
      return true;
    });
  }, [logEntries, filter]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs]);

  const getBorderColor = (type: string) => {
      switch(type) {
          case 'major_event': return 'border-yellow-500';
          case 'event': return 'border-gray-500';
          case 'politics': return 'border-blue-500';
          case 'election': return 'border-green-500';
          case 'personal': return 'border-purple-500';
          case 'death': return 'border-red-600';
          default: return 'border-gray-500';
      }
  };

  const getTabClass = (tab: typeof filter) => 
    `flex-1 text-[10px] uppercase font-bold py-2 border-b-2 transition-colors ${
        filter === tab 
        ? 'border-blue-500 text-white bg-gray-800' 
        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800'
    }`;

  return (
    <div className="absolute bottom-20 right-4 h-[450px] w-[380px] bg-gray-900 bg-opacity-95 text-white shadow-xl overflow-hidden font-sans z-[1500] flex flex-col rounded-lg border border-gray-600">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 shrink-0 border-b border-gray-700">
        <h2 className="text-lg font-bold text-gray-200">Event Log</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
      </div>
      
      {/* Tabs */}
      <div className="flex bg-gray-900 shrink-0">
          <button onClick={() => setFilter('all')} className={getTabClass('all')}>All</button>
          <button onClick={() => setFilter('major')} className={getTabClass('major')}>Major</button>
          <button onClick={() => setFilter('politics')} className={getTabClass('politics')}>Politics</button>
          <button onClick={() => setFilter('death')} className={getTabClass('death')}>Deaths</button>
          <button onClick={() => setFilter('personal')} className={getTabClass('personal')}>Personal</button>
      </div>
      
      <div className="flex-grow overflow-y-auto pr-2 space-y-2 p-3">
        {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm italic">
                <p>No entries found for this category.</p>
            </div>
        ) : (
            filteredLogs.map((entry) => (
                <div key={entry.id} className={`p-3 bg-gray-800 rounded border-l-4 ${getBorderColor(entry.type)} text-sm shadow-sm`}>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className={`font-bold ${entry.type === 'death' ? 'text-red-400' : entry.type === 'major_event' ? 'text-yellow-400' : 'text-gray-300'}`}>
                            {entry.title}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">{entry.date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <p className="text-gray-400 leading-snug text-xs">{entry.description}</p>
                </div>
            ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default EventLogPanel;
