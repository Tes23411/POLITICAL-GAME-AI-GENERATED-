
import { useEffect, useCallback } from 'react';
import { GameState, Character, Party, Demographics, GeoJsonFeature, Affiliation, StrongholdMap, LogType, Government } from '../types';
import { checkForGameEvent } from '../utils/events';
import { shouldCharacterDie, createSuccessor } from '../utils/simulation';
import { determineAIAction } from '../utils/ai';
import { cleanupPoliticalVacancies, cleanupGovernmentVacancies } from '../utils/politics';
import { useGameTime } from './useGameTime';

interface UseGameLoopProps {
    time: ReturnType<typeof useGameTime>;
    gameState: GameState;
    characters: Character[];
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
    parties: Party[];
    setParties: React.Dispatch<React.SetStateAction<Party[]>>;
    demographicsMap: Map<string, Demographics>;
    seatFeatures: GeoJsonFeature[];
    affiliationsMap: Map<string, Affiliation>;
    strongholdMap: StrongholdMap;
    government: Government | null;
    setGovernment: (gov: Government | null) => void;
    nextElectionDate: Date;
    handleGeneralElection: () => void;
    onEventTriggered: (event: any) => void;
    addLog: (title: string, desc: string, type: LogType) => void;
    affiliationToPartyMap: Map<string, string>;
    partiesMap: Map<string, Party>;
}

export const useGameLoop = ({
    time,
    gameState,
    characters,
    setCharacters,
    parties,
    setParties,
    demographicsMap,
    seatFeatures,
    affiliationsMap,
    strongholdMap,
    government,
    setGovernment,
    nextElectionDate,
    handleGeneralElection,
    onEventTriggered,
    addLog,
    affiliationToPartyMap,
    partiesMap
}: UseGameLoopProps) => {
    
    const { currentDate, setCurrentDate, speed, setSpeed, lastTickRef } = time;

    const runGameLoop = useCallback((timestamp: number) => {
        if (!lastTickRef.current) lastTickRef.current = timestamp;
        const elapsed = timestamp - lastTickRef.current;

        if (speed !== null && elapsed > speed) {
            lastTickRef.current = timestamp;
            
            // Advance Day
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            setCurrentDate(nextDate);

            // 1. Check for Random Events (Monthly)
            if (nextDate.getDate() === 1) {
                const event = checkForGameEvent(nextDate, characters, parties, demographicsMap, seatFeatures, affiliationsMap);
                if (event) {
                    onEventTriggered(event);
                    setSpeed(null); // Pause
                    return;
                }
            }
            
            // 2. AI Actions & Simulation
            const seatTotalPopMap = new Map<string, number>();
            const seatAffiliationPopMap = new Map<string, Map<string, number>>();

            characters.forEach(c => {
                if (!c.isAlive) return;
                seatTotalPopMap.set(c.currentSeatCode, (seatTotalPopMap.get(c.currentSeatCode) || 0) + 1);
                
                if (!seatAffiliationPopMap.has(c.currentSeatCode)) {
                    seatAffiliationPopMap.set(c.currentSeatCode, new Map());
                }
                const affMap = seatAffiliationPopMap.get(c.currentSeatCode)!;
                affMap.set(c.affiliationId, (affMap.get(c.affiliationId) || 0) + 1);
            });

            let charsUpdated = false;
            const updatedCharacters = characters.map(char => {
                if (!char.isAlive) return char;

                if (Math.random() < 0.1 && shouldCharacterDie(char, nextDate)) { 
                    charsUpdated = true;
                    addLog('Obituary', `${char.name} has passed away at the age of ${new Date().getFullYear() - new Date(char.dateOfBirth).getFullYear()}.`, 'death');
                    return { ...char, isAlive: false };
                }

                if (char.isPlayer) return char; 

                // AI Action
                let role: any = 'Member';
                const pId = affiliationToPartyMap.get(char.affiliationId);
                const party = pId ? partiesMap.get(pId) : undefined;
                if (party) {
                    if (party.leaderId === char.id) role = 'National Leader';
                    else if (party.deputyLeaderId === char.id) role = 'National Deputy Leader';
                    else {
                        const branch = party.stateBranches.find(b => b.leaderId === char.id);
                        if (branch) role = 'State Leader';
                        else if (party.stateBranches.some(b => b.executiveIds.includes(char.id))) role = 'State Executive';
                    }
                }
                
                const allSeatCodes = seatFeatures.map(f => f.properties.UNIQUECODE);
                const actedChar = determineAIAction(
                    char, role, characters, allSeatCodes, 
                    new Map(seatFeatures.map(f => [f.properties.UNIQUECODE, f])),
                    demographicsMap, affiliationToPartyMap, affiliationsMap,
                    seatAffiliationPopMap, seatTotalPopMap, strongholdMap
                );
                
                if (actedChar !== char) charsUpdated = true;
                return actedChar;
            });

            // Handle Successors
            const newSuccessors: Character[] = [];
            updatedCharacters.forEach((c, idx) => {
                if (!c.isAlive && characters[idx].isAlive) {
                    newSuccessors.push(createSuccessor(c, nextDate));
                }
            });

            if (charsUpdated || newSuccessors.length > 0) {
                setCharacters([...updatedCharacters, ...newSuccessors]);
                
                const livingCharIds = new Set(updatedCharacters.filter(c => c.isAlive).map(c => c.id));
                newSuccessors.forEach(c => livingCharIds.add(c.id));
                
                const cleanedParties = cleanupPoliticalVacancies(parties, livingCharIds, nextDate);
                setParties(cleanedParties);

                if (government) {
                    const cleanedGov = cleanupGovernmentVacancies(government, livingCharIds);
                    if (cleanedGov && (cleanedGov.cabinet.length !== government.cabinet.length || cleanedGov.chiefMinisterId !== government.chiefMinisterId)) {
                        setGovernment(cleanedGov);
                        if (!cleanedGov.chiefMinisterId) {
                            addLog("Government Crisis", "The Chief Minister position is vacant. Government has collapsed.", "major_event");
                            setGovernment(null);
                        }
                    }
                }
            }

            // 4. Election Trigger
             if (nextElectionDate && nextDate >= nextElectionDate && gameState === 'game') {
                handleGeneralElection();
                return; // Stop this loop iteration as handleGeneralElection pauses game
            }
        }

        if (speed !== null) {
            lastTickRef.current = requestAnimationFrame(runGameLoop);
        }
    }, [currentDate, speed, characters, parties, demographicsMap, seatFeatures, affiliationsMap, strongholdMap, nextElectionDate, gameState, affiliationToPartyMap, partiesMap, government]);

    useEffect(() => {
        if (speed !== null) {
            lastTickRef.current = requestAnimationFrame(runGameLoop);
        }
        return () => {
            // No strict cleanup for RAF as ref handles it, but good practice
        };
    }, [speed, runGameLoop]);
};
