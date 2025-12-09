
import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoJsonFeature, Character, Demographics, Party, ElectionResults, Affiliation, StrongholdMap, Government } from '../types';
import { calculateEffectiveInfluence } from '../utils/influence';

interface MapComponentProps {
  features: GeoJsonFeature[];
  characters: Character[];
  demographicsMap: Map<string, Demographics>;
  parties: Party[];
  selectedSeatCode: string | null;
  onSeatClick: (seatCode: string | null) => void;
  affiliationToPartyMap: Map<string, string>;
  electionResults: ElectionResults;
  isPlayerMoving: boolean;
  isPositionSelectionMode?: boolean;
  onPositionSelect?: (seatCode: string) => void;
  affiliationsMap: Map<string, Affiliation>;
  strongholdMap: StrongholdMap;
  government: Government | null;
  detailedElectionResults: Map<string, Map<string, number>>;
}

type MapFilterType = 'PARTY' | 'POPULATION' | 'URBAN_RURAL' | 'GOV_OPP' | 'INCOME' | 'GDP' | 'DEVELOPMENT' | 'MARGIN';

const NEUTRAL_COLOR = '#6b7280'; // Lighter gray for better visibility against dark map
const SELECTED_COLOR = '#00FFFF';
const MOVE_TARGET_COLOR = '#00FFFF';
const PLAYER_LOCATION_COLOR = '#FFD700';

const MapController = () => {
    useMap();
    return null;
}

const getSimulatedData = (seatCode: string, demographics: Demographics | undefined) => {
    if (!demographics) return { income: 0, gdp: 0, development: 0 };
    
    const seed = seatCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rand = (seed % 100) / 100;
    
    const classification = demographics['urbanRuralClassification'];
    const isUrban = typeof classification === 'string' && classification.toUpperCase() === 'URBAN';

    const baseIncome = isUrban ? 400 : 150;
    const income = Math.round(baseIncome + (rand * (isUrban ? 400 : 200)));

    const baseGDP = isUrban ? 3000 : 1000;
    const gdp = Math.round(baseGDP + (rand * (isUrban ? 5000 : 1500)));

    const baseDev = isUrban ? 60 : 20;
    const development = Math.round(Math.min(100, baseDev + (rand * 30)));

    return { income, gdp, development };
};

const MapComponent: React.FC<MapComponentProps> = ({
  features,
  characters,
  demographicsMap,
  parties,
  selectedSeatCode,
  onSeatClick,
  affiliationToPartyMap,
  electionResults,
  isPlayerMoving,
  isPositionSelectionMode,
  onPositionSelect,
  affiliationsMap,
  strongholdMap,
  government,
  detailedElectionResults
}) => {
  const [activeFilter, setActiveFilter] = useState<MapFilterType>('PARTY');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const partiesMap = useMemo(() => new Map<string, Party>(parties.map(p => [p.id, p])), [parties]);
  const player = useMemo(() => characters.find(c => c.isPlayer), [characters]);

  const { maxPop } = useMemo(() => {
    let maxP = 0;
    demographicsMap.forEach(d => {
        if (d.totalElectorate > maxP) maxP = d.totalElectorate;
    });
    return { maxPop: maxP };
  }, [demographicsMap]);

  const style = (feature: any) => {
      const seatCode = feature.properties.UNIQUECODE;
      const winningPartyId = electionResults.get(seatCode);
      const demographics = demographicsMap.get(seatCode);
      const simData = getSimulatedData(seatCode, demographics);
      
      let fillColor = NEUTRAL_COLOR;
      let color = '#1a1a1a';
      let weight = 1;
      let fillOpacity = 0.6; 

      switch (activeFilter) {
          case 'PARTY':
              if (winningPartyId) {
                  fillColor = partiesMap.get(winningPartyId)?.color || NEUTRAL_COLOR;
                  fillOpacity = 0.8;
              } else {
                   // Fallback influence color visualization if no election yet
                   // Calculate dominant party based on influence
                   const seatChars = characters.filter(c => c.isAlive && c.currentSeatCode === seatCode);
                   let maxInfluence = 0;
                   let dominantPartyId = '';
                   
                   for (const char of seatChars) {
                        const partyId = affiliationToPartyMap.get(char.affiliationId);
                        if (!partyId) continue;
                        const party = partiesMap.get(partyId);
                        const contestData = party?.contestedSeats.get(seatCode);
                        const inf = calculateEffectiveInfluence(char, feature as GeoJsonFeature, demographics || null, affiliationsMap, strongholdMap, contestData?.candidateId, contestData?.allocatedAffiliationId);
                        
                        if (inf > maxInfluence) {
                            maxInfluence = inf;
                            dominantPartyId = partyId;
                        }
                   }
                   if (dominantPartyId && maxInfluence > 0) {
                       fillColor = partiesMap.get(dominantPartyId)?.color || NEUTRAL_COLOR;
                       fillOpacity = 0.4; 
                   } else {
                       fillColor = NEUTRAL_COLOR;
                       fillOpacity = 0.2;
                   }
              }
              break;

          case 'POPULATION':
               if (demographics) {
                   const intensity = demographics.totalElectorate / maxPop;
                   const lightness = 80 - (intensity * 60);
                   fillColor = `hsl(120, 70%, ${lightness}%)`;
               }
               break;

          case 'URBAN_RURAL':
              if (demographics) {
                  const classification = demographics['urbanRuralClassification'];
                  const isUrban = typeof classification === 'string' && classification.toUpperCase() === 'URBAN';
                  fillColor = isUrban ? '#a855f7' : '#22c55e';
              }
              break;

          case 'GOV_OPP':
              if (winningPartyId && government) {
                  if (government.rulingCoalitionIds.includes(winningPartyId)) {
                      fillColor = '#3b82f6';
                  } else {
                      fillColor = '#ef4444'; 
                  }
              } else {
                  fillColor = '#6b7280';
              }
              break;

          case 'INCOME':
               const incomeNorm = Math.min(1, Math.max(0, (simData.income - 150) / 650));
               const hueInc = incomeNorm * 120;
               fillColor = `hsl(${hueInc}, 70%, 40%)`;
               break;

          case 'GDP':
               const gdpNorm = Math.min(1, Math.max(0, (simData.gdp - 1000) / 7000));
               const lightGDP = 90 - (gdpNorm * 70);
               fillColor = `hsl(210, 80%, ${lightGDP}%)`;
               break;

          case 'DEVELOPMENT':
               const devNorm = simData.development / 100;
               const hueDev = 30 + (devNorm * 150);
               fillColor = `hsl(${hueDev}, 60%, 40%)`;
               break;

          case 'MARGIN':
               const seatResults = detailedElectionResults.get(seatCode);
               if (seatResults && winningPartyId) {
                   const votes = Array.from(seatResults.values());
                   const totalVotes = votes.reduce((a, b) => a + b, 0);
                   const winnerVotes = seatResults.get(winningPartyId) || 0;
                   let runnerUpVotes = 0;
                   for(const [pid, v] of seatResults.entries()) {
                       if (pid !== winningPartyId && v > runnerUpVotes) runnerUpVotes = v;
                   }
                   
                   const margin = totalVotes > 0 ? (winnerVotes - runnerUpVotes) / totalVotes : 0;
                   
                   if (margin < 0.05) fillColor = '#ef4444';
                   else if (margin < 0.15) fillColor = '#eab308';
                   else fillColor = '#22c55e';
                   
               } else {
                   fillColor = NEUTRAL_COLOR;
                   fillOpacity = 0.3;
               }
               break;
      }

      if (isPositionSelectionMode) {
          fillColor = '#444444';
          fillOpacity = 0.5;
          color = '#666';
      } else if (isPlayerMoving) {
          if (player && seatCode === player.currentSeatCode) {
               color = PLAYER_LOCATION_COLOR;
               weight = 3;
               fillOpacity = 0.9;
          } else {
              color = MOVE_TARGET_COLOR;
              weight = 1;
              fillOpacity = 0.2;
          }
      }

      if (seatCode === selectedSeatCode) {
          color = SELECTED_COLOR;
          weight = 3;
          fillOpacity = 0.9;
      }

      return {
          fillColor,
          color,
          weight,
          fillOpacity,
          fill: true
      };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
      const seatCode = feature.properties.UNIQUECODE;
      const seatName = feature.properties.PARLIMEN || 'Unknown';
      const demoData = demographicsMap.get(seatCode);
      const winningPartyId = electionResults.get(seatCode);
      let ownerParty = winningPartyId ? partiesMap.get(winningPartyId) : null;
      
      let isProjected = false;
      if (!ownerParty) {
           const seatChars = characters.filter(c => c.isAlive && c.currentSeatCode === seatCode);
           let maxInfluence = 0;
           let dominantPartyId = '';
           for (const char of seatChars) {
                const partyId = affiliationToPartyMap.get(char.affiliationId);
                if (!partyId) continue;
                const party = partiesMap.get(partyId);
                const contestData = party?.contestedSeats.get(seatCode);
                const inf = calculateEffectiveInfluence(char, feature as GeoJsonFeature, demoData || null, affiliationsMap, strongholdMap, contestData?.candidateId, contestData?.allocatedAffiliationId);
                
                if (inf > maxInfluence) {
                    maxInfluence = inf;
                    dominantPartyId = partyId;
                }
           }
           if (dominantPartyId) {
               ownerParty = partiesMap.get(dominantPartyId);
               isProjected = true;
           }
      }

      const simData = getSimulatedData(seatCode, demoData);

      let extraInfo = '';
      if (activeFilter === 'INCOME') extraInfo = `<div>Avg Income: $${simData.income}</div>`;
      if (activeFilter === 'GDP') extraInfo = `<div>GDP/Capita: $${simData.gdp}</div>`;
      if (activeFilter === 'DEVELOPMENT') extraInfo = `<div>Dev Index: ${simData.development}/100</div>`;
      if (activeFilter === 'POPULATION' && demoData) extraInfo = `<div>Electorate: ${demoData.totalElectorate.toLocaleString()}</div>`;
      if (activeFilter === 'URBAN_RURAL' && demoData) extraInfo = `<div>Class: ${demoData['urbanRuralClassification']}</div>`;

      const tooltipContent = `
        <div class="font-sans text-left">
          <div class="font-bold text-lg mb-1 border-b border-gray-600 pb-1">${seatName}</div>
          ${ownerParty ? `<div class="text-sm mb-1"><span class="text-gray-400">${isProjected ? 'Projected:' : 'Held By:'}</span> <span style="color:${ownerParty.color}" class="font-bold">${ownerParty.name}</span></div>` : '<div class="text-sm text-gray-500 mb-1">No significant influence</div>'}
          ${demoData ? `
            <div class="grid grid-cols-3 gap-2 text-[10px] text-gray-400 bg-gray-800 p-1 rounded mb-1">
               <div class="text-center"><div style="color:#ffe119">${demoData.malayPercent}%</div>M</div>
               <div class="text-center"><div style="color:#e6194B">${demoData.chinesePercent}%</div>C</div>
               <div class="text-center"><div style="color:#f58231">${demoData.indianPercent}%</div>I</div>
            </div>
          ` : ''}
          ${extraInfo ? `<div class="text-xs text-yellow-300 font-mono bg-gray-800 p-1 rounded">${extraInfo}</div>` : ''}
          ${isPositionSelectionMode ? '<div class="mt-2 text-xs text-purple-300 font-bold">Click to Select</div>' : ''}
        </div>
      `;

      layer.bindTooltip(tooltipContent, {
          sticky: true,
          className: 'custom-tooltip',
          direction: 'top',
          opacity: 1
      });

      // Type assertion for layer to access setStyle
      const pathLayer = layer as L.Path;

      pathLayer.on({
          click: () => {
              if (isPositionSelectionMode) {
                  onPositionSelect?.(seatCode);
              } else {
                  onSeatClick(seatCode);
              }
          },
          mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                  weight: 3,
                  color: '#FFF',
                  fillOpacity: 0.9
              });
              target.bringToFront();
          },
          mouseout: (e) => {
              const target = e.target;
              target.setStyle(style(feature));
          }
      });
  };

  const renderLegend = () => {
      switch(activeFilter) {
          case 'PARTY': return <div className="text-xs text-gray-300">Party Control / Projected Influence</div>;
          case 'GOV_OPP':
              return (
                  <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> Government</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Opposition</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-500 rounded-sm"></span> Vacant/Ind</div>
                  </div>
              );
          case 'URBAN_RURAL':
              return (
                  <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-sm"></span> Urban</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Rural</div>
                  </div>
              );
           case 'MARGIN':
              return (
                  <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Strong {'>'}15%</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-sm"></span> Safe 5-15%</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Marginal {'<'}5%</div>
                  </div>
              );
           case 'POPULATION':
              return <div className="text-xs text-gray-300">Population Density (Light to Dark)</div>;
           case 'INCOME':
              return (
                <div className="flex items-center gap-2 text-xs">
                    <span>Low</span>
                    <div className="w-20 h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 rounded-full"></div>
                    <span>High</span>
                </div>
              );
           default: return null;
      }
  };

  return (
    <div className="w-full h-full relative">
        <MapContainer 
            center={[4.2105, 101.9758]} 
            zoom={7} 
            style={{ height: '100%', width: '100%', backgroundColor: '#111827' }}
            zoomControl={false}
            doubleClickZoom={false}
            attributionControl={false}
            minZoom={6}
            maxZoom={10}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap, &copy; CARTO'
            />
            <GeoJSON 
                key={`${isPlayerMoving}-${isPositionSelectionMode}-${selectedSeatCode}-${electionResults.size}-${activeFilter}`} 
                data={features as any} 
                style={style} 
                onEachFeature={onEachFeature} 
            />
            <MapController />
        </MapContainer>

        {/* Filter FAB */}
        <div className="absolute bottom-8 right-8 z-[2000] flex flex-col items-end gap-2 font-sans pointer-events-auto">
            
            {/* Legend Panel */}
            {activeFilter !== 'PARTY' && (
                <div className="bg-gray-900/90 text-white p-3 rounded-lg shadow-lg border border-gray-600 mb-2 backdrop-blur-sm animate-fadeIn">
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">{activeFilter.replace('_', ' ')}</h4>
                     {renderLegend()}
                </div>
            )}

            {/* Menu */}
            {isFilterMenuOpen && (
                <div className="bg-gray-800 text-white rounded-lg shadow-xl border border-gray-600 overflow-hidden mb-2 animate-slideUp">
                    <div className="flex flex-col min-w-[160px]">
                        <button onClick={() => { setActiveFilter('PARTY'); setIsFilterMenuOpen(false); }} className={`px-4 py-2 text-left text-sm hover:bg-gray-700 ${activeFilter === 'PARTY' ? 'text-blue-400 font-bold bg-gray-700/50' : 'text-gray-300'}`}>Political Party</button>
                        <button onClick={() => { setActiveFilter('GOV_OPP'); setIsFilterMenuOpen(false); }} className={`px-4 py-2 text-left text-sm hover:bg-gray-700 ${activeFilter === 'GOV_OPP' ? 'text-blue-400 font-bold bg-gray-700/50' : 'text-gray-300'}`}>Govt vs Opposition</button>
                        <button onClick={() => { setActiveFilter('MARGIN'); setIsFilterMenuOpen(false); }} className={`px-4 py-2 text-left text-sm hover:bg-gray-700 ${activeFilter === 'MARGIN' ? 'text-blue-400 font-bold bg-gray-700/50' : 'text-gray-300'}`}>Support Margin</button>
                        <div className="h-px bg-gray-700 my-1"></div>
                        <button onClick={() => { setActiveFilter('POPULATION'); setIsFilterMenuOpen(false); }} className={`px-4 py-2 text-left text-sm hover:bg-gray-700 ${activeFilter === 'POPULATION' ? 'text-blue-400 font-bold bg-gray-700/50' : 'text-gray-300'}`}>Population</button>
                        <button onClick={() => { setActiveFilter('URBAN_RURAL'); setIsFilterMenuOpen(false); }} className={`px-4 py-2 text-left text-sm hover:bg-gray-700 ${activeFilter === 'URBAN_RURAL' ? 'text-blue-400 font-bold bg-gray-700/50' : 'text-gray-300'}`}>Urban / Rural</button>
                        <div className="h-px bg-gray-700 my-1"></div>
                        <button onClick={() => { setActiveFilter('INCOME'); setIsFilterMenuOpen(false); }} className={`px-4 py-2 text-left text-sm hover:bg-gray-700 ${activeFilter === 'INCOME' ? 'text-blue-400 font-bold bg-gray-700/50' : 'text-gray-300'}`}>Income Levels</button>
                        <button onClick={() => { setActiveFilter('GDP'); setIsFilterMenuOpen(false); }} className={`px-4 py-2 text-left text-sm hover:bg-gray-700 ${activeFilter === 'GDP' ? 'text-blue-400 font-bold bg-gray-700/50' : 'text-gray-300'}`}>GDP Per Capita</button>
                        <button onClick={() => { setActiveFilter('DEVELOPMENT'); setIsFilterMenuOpen(false); }} className={`px-4 py-2 text-left text-sm hover:bg-gray-700 ${activeFilter === 'DEVELOPMENT' ? 'text-blue-400 font-bold bg-gray-700/50' : 'text-gray-300'}`}>Development Index</button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-105 border-2 ${isFilterMenuOpen || activeFilter !== 'PARTY' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                title="Map Filters"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
            </button>
        </div>
    </div>
  );
};

export default MapComponent;
