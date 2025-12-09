
import { Character, Ideology, GeoJsonFeature, Demographics, Party, Affiliation } from '../types';
import { generateCharacterName } from './naming';

// Mortality rates per day based on age brackets
const getMortalityRate = (age: number): number => {
    if (age < 50) return 0.00005; // 1 in 20,000 chance per day
    if (age < 60) return 0.0001;  // 1 in 10,000
    if (age < 70) return 0.0005;  // 1 in 2,000
    if (age < 80) return 0.0015;  // 1 in 666
    if (age < 90) return 0.005;   // 1 in 200
    return 0.02;                  // 1 in 50 (90+)
};

export const shouldCharacterDie = (character: Character, currentDate: Date): boolean => {
    if (!character.isAlive) return false;
    
    // Calculate Age
    const age = Math.floor((currentDate.getTime() - new Date(character.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    
    const chance = getMortalityRate(age);
    return Math.random() < chance;
};

export const createSuccessor = (deceased: Character, currentDate: Date): Character => {
    // Generate new birth date (25 to 50 years old)
    const ageInYears = 25 + Math.floor(Math.random() * 25);
    const dob = new Date(currentDate);
    dob.setFullYear(dob.getFullYear() - ageInYears);
    dob.setMonth(Math.floor(Math.random() * 12));
    dob.setDate(Math.floor(Math.random() * 28));

    // Slight ideological drift from the predecessor
    const driftEco = (Math.random() * 20) - 10;
    const driftGov = (Math.random() * 20) - 10;
    
    const newIdeology: Ideology = {
        economic: Math.max(0, Math.min(100, deceased.ideology.economic + driftEco)),
        governance: Math.max(0, Math.min(100, deceased.ideology.governance + driftGov))
    };

    return {
        id: `npc-${deceased.currentSeatCode}-${deceased.affiliationId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: generateCharacterName(deceased.ethnicity),
        affiliationId: deceased.affiliationId,
        ethnicity: deceased.ethnicity,
        state: deceased.state, // Inherits home state
        currentSeatCode: deceased.currentSeatCode, // Spawns in same seat
        // Stats are fresh, slightly randomized, generally lower than a dying veteran might have had
        charisma: 20 + Math.floor(Math.random() * 60), 
        influence: 10 + Math.floor(Math.random() * 40),
        recognition: 5 + Math.floor(Math.random() * 20),
        dateOfBirth: dob,
        isAlive: true,
        isPlayer: false,
        isMP: false, // Successor does not inherit the MP seat immediately (triggers by-election logic conceptually, or vacancy)
        isAffiliationLeader: false,
        history: [
            { 
                date: currentDate, 
                event: `Emerged as a new voice for the ${deceased.affiliationId} faction in ${deceased.currentSeatCode}, succeeding ${deceased.name}.` 
            }
        ],
        ideology: newIdeology
    };
};

export const populateWorldCharacters = (
    seats: GeoJsonFeature[], 
    demos: Map<string, Demographics>, 
    partyList: Party[], 
    affMap: Map<string, Affiliation>
): Character[] => {
    const newCharacters: Character[] = [];
    let charIdCounter = 0;

    seats.forEach(seat => {
        const seatCode = seat.properties.UNIQUECODE;
        const demo = demos.get(seatCode);
        if (!demo) return;

        partyList.forEach(party => {
            party.affiliationIds.forEach(affId => {
                const affiliation = affMap.get(affId);
                if (!affiliation) return;

                let percent = 0;
                if (affiliation.ethnicity === 'Malay') percent = demo.malayPercent;
                else if (affiliation.ethnicity === 'Chinese') percent = demo.chinesePercent;
                else if (affiliation.ethnicity === 'Indian') percent = demo.indianPercent;
                
                // Generate character only if ethnicity presence is >= 2%
                if (percent >= 2.0) {
                    newCharacters.push({
                        id: `npc-${seatCode}-${affId}-${charIdCounter++}`,
                        name: generateCharacterName(affiliation.ethnicity),
                        affiliationId: affId,
                        ethnicity: affiliation.ethnicity,
                        state: seat.properties.NEGERI,
                        currentSeatCode: seatCode,
                        isAlive: true,
                        dateOfBirth: new Date(1915 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1), // 20-50yo roughly
                        charisma: Math.floor(Math.random() * 50) + 15,
                        influence: Math.floor(Math.random() * 40) + 10,
                        recognition: Math.floor(Math.random() * 30) + 5,
                        history: [],
                        ideology: affiliation.ideology || affiliation.baseIdeology || { economic: 50, governance: 50 },
                        isMP: false,
                        isPlayer: false
                    });
                }
            });
        });
    });
    return newCharacters;
};
