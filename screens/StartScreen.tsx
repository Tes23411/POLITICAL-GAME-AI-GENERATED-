
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  onSpectate: () => void;
  isDataLoaded: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onSpectate, isDataLoaded }) => {
  return (
    <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 text-white font-sans">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
        <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-4 text-blue-400">
          Political World Game
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          A real-time political simulation.
        </p>
        
        {!isDataLoaded ? (
             <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 animate-pulse">Loading World Data...</p>
             </div>
        ) : (
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                onClick={onStart}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50"
                >
                Start Game
                </button>
                <button
                onClick={onSpectate}
                className="px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-teal-900/50"
                >
                Spectator Mode
                </button>
            </div>
        )}
      </div>
      <p className="fixed bottom-4 text-xs text-gray-600">v1.2 - Data Embedded</p>
    </div>
  );
};

export default StartScreen;
