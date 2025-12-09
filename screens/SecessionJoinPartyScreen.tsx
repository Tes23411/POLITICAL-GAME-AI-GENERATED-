
import React from 'react';
import { Party, Affiliation } from '../types';

interface SecessionJoinPartyScreenProps {
  parties: Party[];
  currentPartyId: string;
  affiliation: Affiliation;
  onSelect: (partyId: string) => void;
  onCancel: () => void;
}

const SecessionJoinPartyScreen: React.FC<SecessionJoinPartyScreenProps> = ({ parties, currentPartyId, affiliation, onSelect, onCancel }) => {
  // Filter parties:
  // 1. Cannot join current party.
  // 2. Can join Multi-Ethnic parties (ethnicityFocus is undefined).
  // 3. Can join Single-Ethnic parties only if ethnicities match.
  const availableParties = parties.filter(p => {
      if (p.id === currentPartyId) return false;
      if (!p.ethnicityFocus) return true; // Multi-ethnic
      return p.ethnicityFocus === affiliation.ethnicity; // Matching ethnicity
  });

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 z-[5000] flex items-center justify-center font-sans p-4">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <h2 className="text-3xl font-bold mb-2 text-center">Join Another Party</h2>
        <div className="text-center mb-6">
            <p className="text-gray-400">Choose which party your affiliation will join.</p>
            <p className="text-sm text-gray-500 mt-1">
                Your faction is <span className="font-semibold text-gray-300">{affiliation.ethnicity}</span>. 
                You can only join Multi-Ethnic parties or parties of the same ethnicity.
            </p>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableParties.length > 0 ? (
              availableParties.map(party => (
                <button
                  key={party.id}
                  onClick={() => onSelect(party.id)}
                  className="p-4 rounded-lg text-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md relative overflow-hidden group"
                  style={{ backgroundColor: party.color }}
                >
                  <div className="absolute inset-0 bg-black opacity-20 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative z-10" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                      <h3 className="text-xl font-bold">{party.name}</h3>
                      <p className="text-xs mt-1 font-medium opacity-90">
                          {party.ethnicityFocus ? `${party.ethnicityFocus} Only` : 'Multi-Ethnic'}
                      </p>
                  </div>
                </button>
              ))
          ) : (
              <div className="col-span-full text-center text-gray-500 py-10 italic">
                  No compatible parties available to join.
              </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <button onClick={onCancel} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 font-bold rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecessionJoinPartyScreen;
