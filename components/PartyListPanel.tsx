
import React from 'react';
import { Party, Affiliation } from '../types';

interface PartyListPanelProps {
  parties: Party[];
  affiliationsMap: Map<string, Affiliation>;
  onClose: () => void;
  onPartyClick: (partyId: string) => void;
}

const PartyListPanel: React.FC<PartyListPanelProps> = ({ parties, affiliationsMap, onClose, onPartyClick }) => {
  return (
    <div className="absolute top-20 left-4 h-[calc(100%-5.5rem)] w-[400px] bg-gray-800 bg-opacity-95 text-white p-4 shadow-lg overflow-y-auto font-sans z-[1500] flex flex-col rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-2xl font-bold">Political Parties</h2>
        <button onClick={onClose} className="text-2xl hover:text-red-500">&times;</button>
      </div>
      
      <div className="space-y-3">
        {parties.map(party => (
          <div 
            key={party.id} 
            onClick={() => onPartyClick(party.id)}
            className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: party.color }}></div>
              <h3 className="text-lg font-bold" style={{ color: party.color }}>{party.name}</h3>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {party.affiliationIds.map(affId => {
                const aff = affiliationsMap.get(affId);
                return aff ? (
                  <span key={affId} className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700 text-gray-300">
                    {aff.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartyListPanel;
