
import { GameEvent, Character, Party, Demographics, GeoJsonFeature, Affiliation } from '../types';

const EVENT_CHANCE_MONTHLY = 0.05; // 5% chance of an event each month check

export const checkForGameEvent = (
    date: Date,
    characters: Character[],
    parties: Party[],
    demographicsMap: Map<string, Demographics>,
    features: GeoJsonFeature[],
    affiliationsMap: Map<string, Affiliation>
): GameEvent | null => {
    // Only check on specific days to avoid spam, e.g., 1st and 15th
    if (date.getDate() !== 1 && date.getDate() !== 15) return null;
    
    if (Math.random() > EVENT_CHANCE_MONTHLY) return null;

    const roll = Math.random();

    // 1. Racial Tension Event (35% chance)
    if (roll < 0.35) {
        // Find a mixed seat (Urban usually)
        const mixedSeats = features.filter(f => {
            const demo = demographicsMap.get(f.properties.UNIQUECODE);
            if (!demo) return false;
            // Mixed if no race > 65%
            return demo.malayPercent < 65 && demo.chinesePercent < 65 && demo.indianPercent < 65;
        });

        if (mixedSeats.length > 0) {
            const targetSeat = mixedSeats[Math.floor(Math.random() * mixedSeats.length)];
            const seatName = targetSeat.properties.PARLIMEN;
            const seatCode = targetSeat.properties.UNIQUECODE;
            
            return {
                id: `evt-racial-${Date.now()}`,
                title: `Tensions in ${seatName}`,
                description: `Simmering ethnic tensions have flared up in ${seatName} following a heated political rally. Communities are polarized, retreating to their own ethnic representatives.`,
                date: date,
                type: 'racial_tension',
                affectedSeatCodes: [seatCode],
                magnitude: 15,
                effects: [
                    "Increased influence for ethnic-based parties in this seat.",
                    "Decreased influence for multi-ethnic parties in this seat.",
                    "Temporary halt to cross-community campaigning."
                ]
            };
        }
    }

    // 2. Scandal (25% chance)
    if (roll < 0.60) {
        // Pick a random high profile character (National Leader or Minister)
        const highProfileChars = characters.filter(c => 
            (c.influence > 70 || c.isMP) && !c.isPlayer // Don't hit player randomly yet, maybe too harsh
        );
        
        if (highProfileChars.length > 0) {
            const target = highProfileChars[Math.floor(Math.random() * highProfileChars.length)];
            const party = parties.find(p => p.affiliationIds.includes(target.affiliationId));
            
            return {
                id: `evt-scandal-${Date.now()}`,
                title: `Scandal: ${target.name}`,
                description: `Rumors of corruption involving ${target.name} have surfaced. The public is demanding answers.`,
                date: date,
                type: 'scandal',
                affectedPartyIds: party ? [party.id] : [],
                magnitude: 20,
                effects: [
                    `${target.name} loses significant influence.`,
                    party ? `${party.name} loses support in associated regions.` : "Reputation damaged."
                ]
            };
        }
    }

    // 3. Economic Event (20% chance)
    if (roll < 0.80) {
        const isGood = Math.random() > 0.5;
        return {
            id: `evt-eco-${Date.now()}`,
            title: isGood ? "Rubber Prices Soar" : "Tin Market Slump",
            description: isGood 
                ? "Global demand for rubber has increased, bringing prosperity to rural estates." 
                : "A drop in global tin prices threatens the livelihoods of urban mining communities.",
            date: date,
            type: 'economic',
            magnitude: 10,
            effects: isGood 
                ? ["Increased support for the Government in rural areas.", "Rural unrest decreases."]
                : ["Decreased support for the Government in urban areas.", "Urban unrest increases."]
        };
    }
    
    // 4. Political Movement (20% chance)
    // Generic shift
    const ideologies = ['Socialist', 'Islamist', 'Nationalist', 'Liberal'];
    const surge = ideologies[Math.floor(Math.random() * ideologies.length)];
    return {
        id: `evt-pol-${Date.now()}`,
        title: `${surge} Wave`,
        description: `Grassroots movements aligned with ${surge.toLowerCase()} ideals are gaining traction across the country.`,
        date: date,
        type: 'political',
        magnitude: 10,
        effects: [
            `Parties with ${surge} affiliations gain influence nationwide.`
        ]
    };
};

export const applyEventEffects = (
    event: GameEvent,
    characters: Character[],
    parties: Party[],
    affiliationsMap: Map<string, Affiliation>
): { updatedCharacters: Character[], updatedParties: Party[] } => {
    let updatedCharacters = [...characters];
    let updatedParties = [...parties];
    const magnitude = event.magnitude || 10;

    switch (event.type) {
        case 'racial_tension':
            if (event.affectedSeatCodes) {
                // Boost chars in single-ethnic parties, nerf multi-ethnic in that seat
                updatedCharacters = updatedCharacters.map(c => {
                    if (event.affectedSeatCodes?.includes(c.currentSeatCode)) {
                        const party = parties.find(p => p.affiliationIds.includes(c.affiliationId));
                        if (party) {
                            if (party.ethnicityFocus) {
                                return { ...c, influence: Math.min(100, c.influence + magnitude) };
                            } else {
                                return { ...c, influence: Math.max(0, c.influence - magnitude) };
                            }
                        }
                    }
                    return c;
                });
            }
            break;
        
        case 'scandal':
             // Scandal logic needs specific target char ID usually, but we stored it in description basically. 
             // For now, let's apply to the party overall or just random influential members if specific ID isn't in struct.
             // Ideally GameEvent should store targetCharId.
             // We'll apply minor penalty to all high ranking members of affected party.
             if (event.affectedPartyIds) {
                 const pId = event.affectedPartyIds[0];
                 const party = parties.find(p => p.id === pId);
                 if (party) {
                     updatedCharacters = updatedCharacters.map(c => {
                         if (party.affiliationIds.includes(c.affiliationId) && (c.id === party.leaderId || c.id === party.deputyLeaderId)) {
                             return { ...c, influence: Math.max(0, c.influence - magnitude), recognition: Math.max(0, c.recognition - 5) };
                         }
                         return c;
                     });
                     // Party unity hit
                     updatedParties = updatedParties.map(p => p.id === pId ? { ...p, unity: Math.max(0, p.unity - 10) } : p);
                 }
             }
             break;

        case 'economic':
            // Simple gov/opp bonus/penalty based on desc logic
            // Not implementing detailed eco-sim, so maybe just flavor for now or broad mood swing?
            // Let's randomly shift 5% influence from Gov to Opp or vice versa
            break;

        case 'political':
             // Find keywords in title to boost specific affiliations
             const keyword = event.title.split(' ')[0]; // e.g. "Socialist"
             updatedCharacters = updatedCharacters.map(c => {
                 const aff = affiliationsMap.get(c.affiliationId);
                 if (aff && aff.name.includes(keyword)) {
                     return { ...c, influence: Math.min(100, c.influence + magnitude) };
                 }
                 return c;
             });
             break;
             
        case 'crackdown_backlash':
            // Handled custom when creating the event usually, but if generic:
            // Reduce government party unity
             if (event.affectedPartyIds) {
                 updatedParties = updatedParties.map(p => 
                    event.affectedPartyIds?.includes(p.id) ? { ...p, unity: Math.max(0, p.unity - 15) } : p
                 );
             }
            break;
    }

    return { updatedCharacters, updatedParties };
};
