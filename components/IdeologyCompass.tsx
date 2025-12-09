
import React from 'react';
import { Ideology } from '../types';
import { getIdeologyName } from '../utils/politics';

interface IdeologyCompassProps {
  mainIdeology: Ideology;
  mainLabel?: string;
  otherIdeologies?: { ideology: Ideology; label: string; color: string }[];
  size?: number;
}

const IdeologyCompass: React.FC<IdeologyCompassProps> = ({ mainIdeology, mainLabel = "You", otherIdeologies = [], size = 200 }) => {
  const padding = 20;
  const plotSize = size - padding * 2;
  
  // Convert ideology (0-100) to coordinate (0-plotSize)
  // X: Economic (0=Planned, 100=Market)
  // Y: Governance (0=Decentralized, 100=Centralized) -> BUT in standard compass charts, Y is Authority (Up) vs Liberty (Down).
  // Let's stick to the data structure: 0-100.
  // To map to SVG: 
  // X (0 to 100) -> (0 to plotSize)
  // Y (100 to 0) -> (0 to plotSize) because SVG Y grows downwards. 100 (Centralized) should be Top (0).
  
  const getX = (val: number) => (val / 100) * plotSize + padding;
  const getY = (val: number) => (1 - val / 100) * plotSize + padding;

  const ideologyName = getIdeologyName(mainIdeology);

  return (
    <div className="relative flex flex-col items-center">
        <div style={{ width: size, height: size }} className="relative bg-gray-800 border border-gray-600 rounded shadow-inner">
            {/* Axes Background */}
            <div className="absolute inset-0 m-[20px]">
                {/* Quadrants */}
                <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-900/20 border-r border-b border-gray-600/50"></div> {/* Auth Left */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-900/20 border-b border-gray-600/50"></div> {/* Auth Right */}
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-900/20 border-r border-gray-600/50"></div> {/* Lib Left */}
                <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-900/20"></div> {/* Lib Right */}
                
                {/* Axis Lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-400"></div>
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-400"></div>
            </div>

            {/* Labels */}
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-bold">Centralized</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-bold">Decentralized</span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-gray-400 font-bold">Planned</span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-[10px] text-gray-400 font-bold">Market</span>

            {/* Other Points */}
            {otherIdeologies.map((item, idx) => (
                <div 
                    key={idx}
                    className="absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 border border-black/50 shadow-sm"
                    style={{ 
                        left: getX(item.ideology.economic), 
                        top: getY(item.ideology.governance),
                        backgroundColor: item.color
                    }}
                    title={`${item.label}: Eco ${Math.round(item.ideology.economic)}, Gov ${Math.round(item.ideology.governance)}`}
                />
            ))}

            {/* Main Point */}
            <div 
                className="absolute w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-black shadow-md z-10 animate-pulse"
                style={{ 
                    left: getX(mainIdeology.economic), 
                    top: getY(mainIdeology.governance)
                }}
                title={`${mainLabel}: Eco ${Math.round(mainIdeology.economic)}, Gov ${Math.round(mainIdeology.governance)}`}
            />
        </div>
        
        {/* Legend / Stats */}
        <div className="mt-2 text-xs text-center text-gray-300 space-y-1">
            <div className="font-bold text-sm text-white">{ideologyName}</div>
            <div><span className="font-bold text-gray-400">Eco:</span> {Math.round(mainIdeology.economic)} <span className="font-bold text-gray-400">Gov:</span> {Math.round(mainIdeology.governance)}</div>
        </div>
    </div>
  );
};

export default IdeologyCompass;
