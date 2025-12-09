
import React from 'react';
import { Party } from '../types';

interface PartySelectionScreenProps {
  parties: Party[];
  onPartySelect: (party: Party) => void;
}

const PartySelectionScreen: React.FC<PartySelectionScreenProps> = ({ parties, onPartySelect }) => {
  return (
    <div className="absolute inset-0 z-[5000] flex flex-col items-center justify-center bg-gray-900 text-white font-sans p-4">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">Choose Your Party</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {parties.map(party => (
          <div
            key={party.id}
            onClick={() => onPartySelect(party)}
            className="p-8 rounded-lg text-center cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg border-2 border-transparent hover:border-white relative overflow-hidden group"
            style={{ backgroundColor: party.color }}
          >
             <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-0 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-white uppercase relative z-10" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>{party.name}</h2>
            <p className="text-white/80 text-sm mt-2 relative z-10 font-medium">Click to Select</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartySelectionScreen;
