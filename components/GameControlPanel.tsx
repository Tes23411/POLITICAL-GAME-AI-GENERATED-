
import React from 'react';
import { Speed, PlaySpeedValue } from '../types';

interface GameControlPanelProps {
  currentDate: Date;
  currentSpeed: Speed;
  onSpeedChange: (speed: PlaySpeedValue) => void;
  onPlay: () => void;
  onPause: () => void;
  nextElectionDate: Date | null;
  onShowParliament: () => void;
  electionHappened: boolean;
  onOpenHistory: () => void;
  isElectionClose: boolean;
  onOpenParties: () => void;
  observeMode: boolean;
  onToggleObserveMode: () => void;
  onToggleLog: () => void;
  unreadLogCount: number;
  onOpenCountryInfo: () => void;
}

const speedLevels: { label: string; value: PlaySpeedValue }[] = [
  { label: '1x', value: 2000 },
  { label: '2x', value: 500 },
  { label: '4x', value: 125 },
  { label: '8x', value: 50 },
  { label: '16x', value: 5 },
];

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.017l3.75 2.25a.75.75 0 010 1.282l-3.75 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
    </svg>
  );
  
const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zM8.25 7.25a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5zM12 7.25a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 8.142 2.383 9.336 6.41.147.497.147 1.028 0 1.526C18.142 14.617 14.257 17 10 17c-4.257 0-8.142-2.383-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-5.533.749.749 0 000-.482C18.142 5.383 14.257 3 10 3 7.778 3 5.679 3.655 3.896 4.783L3.28 2.22zm-1.002 8.286a.75.75 0 01.378-.962 10.038 10.038 0 012.353-1.424l1.328 1.328a4.015 4.015 0 004.996 4.996l3.693 3.693a10.04 10.04 0 01-5.026 1.313c-4.257 0-8.142-2.383-9.336-6.41a.75.75 0 01-.386-.534z" clipRule="evenodd" />
        <path d="M12.454 10.333l-4.12-4.12c.504-.153 1.042-.213 1.576-.213a4 4 0 012.544 4.333z" />
    </svg>
);

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.172 6.556a5.556 5.556 0 00-.77 2.062 8.01 8.01 0 01-1.374.073 6.002 6.002 0 012.144-2.135zm.366-1.127a6.002 6.002 0 013.348-1.332 6.02 6.02 0 011.666.906 8.016 8.016 0 01-1.18 1.096 8.026 8.026 0 01-3.834-.67zM10.75 5.25a6.012 6.012 0 011.968 1.157 8.025 8.025 0 01-2.923.364 8.006 8.006 0 01.955-1.52zM4.106 10c.026.549.102 1.08.223 1.59a5.547 5.547 0 00.672 2.016 6.002 6.002 0 01-1.071-.78 6.001 6.001 0 01.176-2.826zm10.722-1.382a8.03 8.03 0 01.15 1.554 8.036 8.036 0 01-1.557 5.37 8.025 8.025 0 01-1.442.84 6.002 6.002 0 01-2.979-3.238 6.004 6.004 0 012.849-4.526zm-5.467 4.908a6.006 6.006 0 01-2.585-1.996 8.013 8.013 0 01-1.636-2.613 6.003 6.003 0 013.79 1.632 8.035 8.035 0 01.43 2.977z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.984 3.655a6.002 6.002 0 012.593 1.626 6.002 6.002 0 011.31 2.378 8.017 8.017 0 01-1.443.102 8.033 8.033 0 01-2.46-4.106zM10.5 14.75a6.013 6.013 0 01-1.956-1.127 8.01 8.01 0 01-2.128-1.503 8.016 8.016 0 011.455.513 6.006 6.006 0 012.629 2.117zm2.748.163a6.002 6.002 0 01-2.158 1.445 6.003 6.003 0 01-2.073.492 8.006 8.006 0 01.597-1.398 8.038 8.038 0 013.634-.539z" clipRule="evenodd" />
    </svg>
);


const GameControlPanel: React.FC<GameControlPanelProps> = ({ 
    currentDate, 
    currentSpeed, 
    onSpeedChange, 
    onPlay, 
    onPause, 
    nextElectionDate, 
    onShowParliament, 
    electionHappened, 
    onOpenHistory,
    isElectionClose,
    onOpenParties,
    observeMode,
    onToggleObserveMode,
    onToggleLog,
    unreadLogCount,
    onOpenCountryInfo
}) => {
  const isPaused = currentSpeed === null;

  return (
    <div className="bg-gray-800 bg-opacity-90 text-white p-3 shadow-lg font-sans border-b border-gray-700">
      <div className="flex justify-between items-center">
        
        {/* Left Group: Observe Mode & Date */}
        <div className="flex items-center space-x-4">
             {/* Observe Mode Toggle */}
            <button 
                onClick={onToggleObserveMode} 
                className={`p-2 rounded-md transition-colors border ${observeMode ? 'bg-teal-600 border-teal-500 hover:bg-teal-500 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-400'}`}
                title={observeMode ? "Observe Mode Active: Events happen automatically" : "Observe Mode Inactive: Events pause game"}
            >
                {observeMode ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
            
            <div className="flex flex-col text-left">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Date</span>
                <span className="text-xl font-mono font-semibold tracking-wide">
                    {currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            </div>
            {nextElectionDate && (
                <div className="flex flex-col text-left border-l border-gray-600 pl-4">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Next Election</span>
                    <span className={`text-xl font-mono font-semibold tracking-wide ${isElectionClose ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                        {nextElectionDate.getFullYear()}
                    </span>
                </div>
            )}
            <div className="flex items-center space-x-2 ml-4">
                 <button 
                    onClick={onOpenCountryInfo}
                    className="text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors border border-gray-600 flex items-center gap-1"
                    title="National Demographics"
                >
                    <GlobeIcon /> Info
                </button>
                 <button 
                    onClick={onOpenParties}
                    className="text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors border border-gray-600"
                >
                    Parties
                </button>
                <button 
                    onClick={onToggleLog}
                    className="text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors border border-gray-600 relative"
                >
                    Log
                    {unreadLogCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                            {unreadLogCount > 9 ? '9+' : unreadLogCount}
                        </span>
                    )}
                </button>
                 {electionHappened && (
                    <>
                        <button 
                            onClick={onShowParliament}
                            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                        >
                            Parliament
                        </button>
                        <button
                            onClick={onOpenHistory}
                            className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                        >
                            History
                        </button>
                    </>
                    )}
            </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Speed</span>
            <div className="flex items-center space-x-1 bg-gray-900/50 p-1 rounded-md">
                {isPaused ? (
                    <button onClick={onPlay} className="p-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors" aria-label="Play">
                        <PlayIcon />
                    </button>
                ) : (
                    <button onClick={onPause} className="p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors" aria-label="Pause">
                        <PauseIcon />
                    </button>
                )}
                
                <div className="w-px h-6 bg-gray-600 mx-1"></div>

                {speedLevels.map(({ label, value }) => {
                    // Disable high speeds (value < 125) if election is close (<= 20 days)
                    // Note: value is delay in ms, so lower value = faster speed
                    const isDisabled = isElectionClose && value < 125;
                    
                    return (
                        <button
                            key={label}
                            onClick={() => !isDisabled && onSpeedChange(value)}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                            !isPaused && currentSpeed === value
                                ? 'bg-blue-600 text-white'
                                : isDisabled
                                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                            disabled={(!isPaused && currentSpeed === value) || isDisabled}
                            title={isDisabled ? "Speed restricted close to election" : ""}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GameControlPanel;
