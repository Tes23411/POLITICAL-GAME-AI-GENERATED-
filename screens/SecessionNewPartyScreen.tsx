import React, { useState } from 'react';
import { Affiliation, Ethnicity } from '../types';

interface SecessionNewPartyScreenProps {
  onConfirm: (partyName: string, focus: Ethnicity | null) => void;
  onCancel: () => void;
  affiliation: Affiliation;
}

const SecessionNewPartyScreen: React.FC<SecessionNewPartyScreenProps> = ({ onConfirm, onCancel, affiliation }) => {
  const [partyName, setPartyName] = useState('');
  const [focus, setFocus] = useState<Ethnicity | null>(affiliation.ethnicity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (partyName.trim()) {
      onConfirm(partyName.trim(), focus);
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 z-[5000] flex items-center justify-center font-sans p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-4 text-center">Form a New Party</h2>
        <p className="text-center text-gray-400 mb-6">Enter a name for your new political party and choose its ideological focus.</p>
        
        <div className="mb-4">
          <label htmlFor="partyName" className="block text-sm font-medium text-gray-300 mb-1">Party Name</label>
          <input
            id="partyName"
            type="text"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            placeholder="New Party Name"
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
           <label className="block text-sm font-medium text-gray-300 mb-2">Ideological Focus</label>
           <div className="space-y-2 rounded-lg bg-gray-700 p-3">
             <label className="flex items-center space-x-3 cursor-pointer">
               <input 
                  type="radio" 
                  name="focus" 
                  checked={focus === affiliation.ethnicity} 
                  onChange={() => setFocus(affiliation.ethnicity)}
                  className="h-4 w-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500"
                />
               <span className="text-sm">Ethnic-based ({affiliation.ethnicity})</span>
             </label>
             <label className="flex items-center space-x-3 cursor-pointer">
               <input 
                  type="radio" 
                  name="focus" 
                  checked={focus === null} 
                  onChange={() => setFocus(null)}
                  className="h-4 w-4 text-blue-600 bg-gray-900 border-gray-600 focus:ring-blue-500"
                />
               <span className="text-sm">Multi-ethnic</span>
             </label>
           </div>
        </div>

        <div className="flex justify-center gap-4">
           <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 font-bold rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            type="submit"
            disabled={!partyName.trim()}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold rounded-lg transition-colors"
          >
            Found Party
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecessionNewPartyScreen;