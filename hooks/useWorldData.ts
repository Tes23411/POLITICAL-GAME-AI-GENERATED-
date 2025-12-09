
import { useState, useEffect, useMemo } from 'react';
import { GeoJsonFeature, Demographics, Party, Character, Affiliation, StrongholdMap, PoliticalAlliance } from '../types';
import { malaysiaSeatsData } from '../data/kelantan';
import { loadDemographicsData } from '../data/demographics';
import { PARTIES, INITIAL_ALLIANCES, AFFILIATIONS } from '../affiliations';

export const useWorldData = () => {
    const [seatFeatures, setSeatFeatures] = useState<GeoJsonFeature[]>([]);
    const [demographicsMap, setDemographicsMap] = useState<Map<string, Demographics>>(new Map());
    const [parties, setParties] = useState<Party[]>(PARTIES);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [alliances, setAlliances] = useState<PoliticalAlliance[]>(INITIAL_ALLIANCES);
    const [strongholdMap, setStrongholdMap] = useState<StrongholdMap>(new Map());

    const affiliationsMap = useMemo(() => new Map(AFFILIATIONS.map(a => [a.id, a])), []);
    const partiesMap = useMemo(() => new Map(parties.map(p => [p.id, p])), [parties]);
    
    const affiliationToPartyMap = useMemo(() => {
        const map = new Map<string, string>();
        parties.forEach(p => p.affiliationIds.forEach(affId => map.set(affId, p.id)));
        return map;
    }, [parties]);
    
    const featuresMap = useMemo(() => new Map(seatFeatures.map(f => [f.properties.UNIQUECODE, f])), [seatFeatures]);

    useEffect(() => {
        const init = async () => {
            setSeatFeatures(malaysiaSeatsData);
            const demos = await loadDemographicsData();
            const dMap = new Map<string, Demographics>();
            demos.forEach(d => dMap.set(d.uniqueCode, d));
            setDemographicsMap(dMap);
        };
        init();
    }, []);

    return {
        seatFeatures, 
        demographicsMap, 
        parties, 
        setParties, 
        characters, 
        setCharacters,
        alliances, 
        setAlliances, 
        strongholdMap, 
        setStrongholdMap,
        affiliationsMap, 
        partiesMap, 
        affiliationToPartyMap,
        featuresMap
    };
};
