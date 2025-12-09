
import React from 'react';
import { Bill, BillSelectionScreenProps } from '../types';
import { BILLS } from '../utils/legislation';

const BillSelectionScreen: React.FC<BillSelectionScreenProps> = ({ onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[6000] flex items-center justify-center p-4 font-sans">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-600">
        <div className="flex justify-between items-center mb-6 border-b border-gray-600 pb-3">
             <h2 className="text-3xl font-bold text-amber-400">Draft Legislation</h2>
             <button onClick={onCancel} className="text-3xl hover:text-red-500">&times;</button>
        </div>
        <p className="text-gray-400 mb-4">Select a bill template to propose to Parliament. Constitutional amendments require a 2/3 majority.</p>

        <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BILLS.map(bill => (
                <div key={bill.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col hover:bg-gray-750 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg leading-tight">{bill.title}</h3>
                        {bill.isConstitutional && (
                            <span className="bg-red-900/50 text-red-200 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-red-800 ml-2 whitespace-nowrap">Const.</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400 mb-4 flex-grow">{bill.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                        {bill.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-700 px-2 py-0.5 rounded capitalize text-gray-300">{tag}</span>
                        ))}
                    </div>

                    <button 
                        onClick={() => onSelect(bill)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors mt-auto"
                    >
                        Draft Bill
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BillSelectionScreen;
