
import React from 'react';
import { GameEvent } from '../types';

interface EventModalProps {
    event: GameEvent;
    onAcknowledge: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onAcknowledge }) => {
    const getBgColor = (type: string) => {
        switch(type) {
            case 'racial_tension': return 'from-red-900 to-orange-900';
            case 'scandal': return 'from-purple-900 to-gray-900';
            case 'economic': return 'from-green-900 to-blue-900';
            case 'crackdown_backlash': return 'from-gray-800 to-black';
            default: return 'from-blue-900 to-gray-900';
        }
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-[7000] flex items-center justify-center font-sans p-4 backdrop-blur-sm">
            <div className={`bg-gradient-to-br ${getBgColor(event.type)} text-white p-1 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-500`}>
                <div className="bg-gray-900/90 p-8 rounded-xl backdrop-blur-md">
                    <div className="mb-2 text-xs font-mono text-gray-400 uppercase tracking-widest">
                        {event.date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4 leading-tight">{event.title}</h2>
                    
                    <div className="w-16 h-1 bg-white/20 mb-6"></div>
                    
                    <p className="text-gray-300 text-lg leading-relaxed mb-8">
                        {event.description}
                    </p>

                    {event.effects && event.effects.length > 0 && (
                        <div className="bg-black/30 p-4 rounded-lg mb-8 border border-white/10">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Consequences</h3>
                            <ul className="space-y-2">
                                {event.effects.map((effect, idx) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <span className="text-amber-500 mt-1">➤</span>
                                        <span>{effect}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button 
                        onClick={onAcknowledge}
                        className="w-full py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition-transform transform hover:scale-[1.02] active:scale-95"
                    >
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
