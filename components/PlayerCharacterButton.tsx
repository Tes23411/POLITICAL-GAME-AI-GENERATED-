
import React from 'react';
import { Character } from '../types';

interface PlayerCharacterButtonProps {
  player: Character;
  onClick: () => void;
}

const PlayerCharacterButton: React.FC<PlayerCharacterButtonProps> = ({ player, onClick }) => {
  if (!player.isAlive) {
    return (
        <div 
          className="absolute bottom-4 left-4 p-3 bg-gray-800 bg-opacity-90 text-white rounded-lg shadow-lg z-[1000] font-sans flex items-center space-x-3 cursor-not-allowed"
        >
          <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></span>
          <div>
            <h2 className="text-lg font-bold text-gray-500 leading-tight">{player.name}</h2>
            <p className="text-xs text-red-500 leading-tight">Deceased</p>
          </div>
        </div>
    );
  }

  return (
    <button
      className="absolute bottom-4 left-4 p-3 bg-gray-800 bg-opacity-90 text-white rounded-lg shadow-lg z-[1000] font-sans cursor-pointer hover:bg-gray-700 transition-colors flex items-center space-x-3"
      onClick={onClick}
    >
      <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 animate-pulse"></span>
      <div>
        <h2 className="text-lg font-bold leading-tight">{player.name}</h2>
        <p className="text-xs text-gray-400 leading-tight">Click to view details</p>
      </div>
    </button>
  );
};

export default PlayerCharacterButton;
