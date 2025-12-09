
import React from 'react';
import { Party, Affiliation } from '../types';

interface MergerResultModalProps {
    result: {
        accepted: (Party | Affiliation)[];
        rejected: (Party | Affiliation)[];
        newName: string;
    };
    onClose: () => void;
}

const MergerResultModal: React.FC<MergerResultModalProps> = ({ result, onClose }) => {
    const { accepted, rejected, newName } = result;
    const isSuccess = accepted.length > 0;

    const getEntityName = (entity: Party | Affiliation) => entity.name;
    
    let title = "Negotiations Failed";
    let message = "Unfortunately, no one accepted your proposal for a merger.";

    if (isSuccess) {
        title = "Merger Negotiations Complete!";
        message = `The new party, "${newName}", has been formed with the following members.`;
    }

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-[6000] flex items-center justify-center font-sans p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className={`text-2xl font-bold mb-4 text-center ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                    {title}
                </h2>
                <p className="text-gray-300 mb-6 text-center">{message}</p>
                
                {isSuccess && (
                     <div className="mb-4">
                        <h3 className="font-semibold text-green-400 border-b border-gray-600 pb-1 mb-2">Accepted:</h3>
                        <ul className="text-sm list-disc list-inside text-gray-300">
                           {accepted.map(e => <li key={e.id}>{getEntityName(e)}</li>)}
                        </ul>
                    </div>
                )}
                
                {rejected.length > 0 && (
                     <div className="mb-4">
                        <h3 className="font-semibold text-red-400 border-b border-gray-600 pb-1 mb-2">Rejected:</h3>
                         <ul className="text-sm list-disc list-inside text-gray-400">
                            {rejected.map(e => <li key={e.id}>{getEntityName(e)}</li>)}
                        </ul>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MergerResultModal;
