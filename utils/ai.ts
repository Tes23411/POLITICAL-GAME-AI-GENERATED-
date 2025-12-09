
import { Character, Demographics, GeoJsonFeature, Affiliation, CharacterRole, StrongholdMap } from '../types';
import { calculateEffectiveInfluence } from './influence';

const MOVEMENT_CHANCE_REGULAR = 0.05; // 5% chance to consider moving each day
const MOVEMENT_CHANCE_LEADER = 0.5; // 50% chance each update cycle (monthly for leaders)
const NUM_SEATS_TO_EVALUATE_REGULAR = 10;
const NUM_SEATS_TO_EVALUATE_LEADER = 20;
const STATEMENT_ACTION_CHANCE = 0.3; // 30% of actions are statements

/**
 * Calculates the influence margin for a given party in a specific seat.
 * A positive value means the party is winning, negative means losing.
 */
const getPartyMarginInSeat = (
  partyId: string,
  seatCode: string,
  allCharacters: Character[],
  featuresMap: Map<string, GeoJsonFeature>,
  demographicsMap: Map<string, Demographics>,
  affiliationToPartyMap: Map<string, string>,
  affiliationsMap: Map<string, Affiliation>,
  strongholdMap: StrongholdMap
): number => {
  const charactersInSeat = allCharacters.filter(c => c.currentSeatCode === seatCode && c.isAlive);
  const seatFeature = featuresMap.get(seatCode);
  if (!seatFeature) return 0;
  
  const seatDemographics = demographicsMap.get(seatCode);

  const partyInfluenceMap = new Map<string, number>();
  charactersInSeat.forEach(char => {
    const charPartyId = affiliationToPartyMap.get(char.affiliationId);
    if (!charPartyId) return;

    const influence = calculateEffectiveInfluence(char, seatFeature, seatDemographics || null, affiliationsMap, strongholdMap);
    partyInfluenceMap.set(charPartyId, (partyInfluenceMap.get(charPartyId) || 0) + influence);
  });
  
  const targetPartyInfluence = partyInfluenceMap.get(partyId) || 0;
  
  let strongestRivalInfluence = 0;
  for (const [id, influence] of partyInfluenceMap.entries()) {
    if (id !== partyId && influence > strongestRivalInfluence) {
      strongestRivalInfluence = influence;
    }
  }

  return targetPartyInfluence - strongestRivalInfluence;
};

/**
 * AI logic for a regular character. Focuses on personal gain.
 */
const determineRegularAction = (
  character: Character,
  allSeatCodes: string[],
  featuresMap: Map<string, GeoJsonFeature>,
  demographicsMap: Map<string, Demographics>,
  affiliationsMap: Map<string, Affiliation>,
  strongholdMap: StrongholdMap
): Character => {
  const updatedCharacter = { ...character };

  const sampleSeats = [...Array(NUM_SEATS_TO_EVALUATE_REGULAR)].map(() => allSeatCodes[Math.floor(Math.random() * allSeatCodes.length)]);
  
  let bestSeatCode = updatedCharacter.currentSeatCode;
  const currentSeatFeature = featuresMap.get(bestSeatCode);
  if (!currentSeatFeature) return updatedCharacter;

  let maxInfluence = calculateEffectiveInfluence(
    updatedCharacter, currentSeatFeature, demographicsMap.get(bestSeatCode) || null, affiliationsMap, strongholdMap
  );

  for (const seatCode of sampleSeats) {
      const feature = featuresMap.get(seatCode);
      if (!feature) continue;

      const potentialInfluence = calculateEffectiveInfluence(
          updatedCharacter, feature, demographicsMap.get(seatCode) || null, affiliationsMap, strongholdMap
      );

      if (potentialInfluence > maxInfluence) {
          maxInfluence = potentialInfluence;
          bestSeatCode = seatCode;
      }
  }
  
  if (bestSeatCode !== updatedCharacter.currentSeatCode) {
    updatedCharacter.currentSeatCode = bestSeatCode;
  }

  return updatedCharacter;
};

/**
 * AI logic for leaders. Focuses on strategic moves to benefit the party.
 */
const determineStrategicMove = (
  character: Character,
  seatsToConsider: string[],
  allCharacters: Character[],
  featuresMap: Map<string, GeoJsonFeature>,
  demographicsMap: Map<string, Demographics>,
  affiliationToPartyMap: Map<string, string>,
  affiliationsMap: Map<string, Affiliation>,
  strongholdMap: StrongholdMap
): Character => {
    const updatedCharacter = { ...character };
    const partyId = affiliationToPartyMap.get(character.affiliationId);
    if (!partyId) return character;

    let bestMove = { seatCode: character.currentSeatCode, marginImprovement: -Infinity };
    const currentSeatMargin = getPartyMarginInSeat(partyId, character.currentSeatCode, allCharacters, featuresMap, demographicsMap, affiliationToPartyMap, affiliationsMap, strongholdMap);
    
    const uniqueSampleSeats = [...new Set(
        [...Array(NUM_SEATS_TO_EVALUATE_LEADER)].map(() => seatsToConsider[Math.floor(Math.random() * seatsToConsider.length)])
    )];

    for (const targetSeatCode of uniqueSampleSeats) {
        if (!targetSeatCode || targetSeatCode === character.currentSeatCode) continue;

        const targetSeatMargin = getPartyMarginInSeat(partyId, targetSeatCode, allCharacters, featuresMap, demographicsMap, affiliationToPartyMap, affiliationsMap, strongholdMap);
        const hypotheticalCharacters = allCharacters.map(c => 
            c.id === character.id ? { ...c, currentSeatCode: targetSeatCode } : c
        );
        
        const newCurrentSeatMargin = getPartyMarginInSeat(partyId, character.currentSeatCode, hypotheticalCharacters, featuresMap, demographicsMap, affiliationToPartyMap, affiliationsMap, strongholdMap);
        const newTargetSeatMargin = getPartyMarginInSeat(partyId, targetSeatCode, hypotheticalCharacters, featuresMap, demographicsMap, affiliationToPartyMap, affiliationsMap, strongholdMap);

        const marginImprovement = (newCurrentSeatMargin - currentSeatMargin) + (newTargetSeatMargin - targetSeatMargin);

        if (marginImprovement > bestMove.marginImprovement) {
            bestMove = { seatCode: targetSeatCode, marginImprovement };
        }
    }
    
    if (bestMove.marginImprovement > 50) { // Threshold to prevent minor moves
        updatedCharacter.currentSeatCode = bestMove.seatCode;
    }
    
    return updatedCharacter;
};

const performStatementAction = (character: Character, role: CharacterRole): Character => {
    let influenceGain = 0;
    let recognitionGain = 0;

    if (role === 'State Leader' || role === 'National Deputy Leader') {
        // State leaders/Deputies can organize rallies or strengthen branches
        if (Math.random() < 0.5) { // 50% chance to do the better action
            // 'organizeStateRally'
            influenceGain = 10;
            recognitionGain = 5;
        } else {
            // 'strengthenLocalBranch'
            influenceGain = 5;
            recognitionGain = 0;
        }
    } else if (role === 'State Executive') {
         // 'strengthenLocalBranch'
         influenceGain = 5;
         recognitionGain = 0;
    } else { // Member or National Leader (who focuses on moves usually, but does statements if stuck)
         // 'promoteParty'
         influenceGain = 5;
         recognitionGain = 2;
    }
    
    return {
        ...character,
        influence: Math.min(100, character.influence + influenceGain),
        recognition: Math.min(100, character.recognition + recognitionGain),
    };
};

/**
 * Main AI action dispatcher.
 */
export const determineAIAction = (
  character: Character,
  role: CharacterRole,
  allCharacters: Character[],
  allSeatCodes: string[],
  featuresMap: Map<string, GeoJsonFeature>,
  demographicsMap: Map<string, Demographics>,
  affiliationToPartyMap: Map<string, string>,
  affiliationsMap: Map<string, Affiliation>,
  seatAffiliationPopMap: Map<string, Map<string, number>>,
  seatTotalPopMap: Map<string, number>,
  strongholdMap: StrongholdMap
): Character => {
  // Check population constraint: Ensure at least 1 character of the same affiliation remains in the seat
  const seatAffs = seatAffiliationPopMap.get(character.currentSeatCode);
  const affCount = seatAffs ? (seatAffs.get(character.affiliationId) || 0) : 0;
  
  // Check total population constraint: Constituency must be left with at least 9 characters
  const totalPop = seatTotalPopMap.get(character.currentSeatCode) || 0;

  // If there is more than 1 member of this affiliation AND population is sufficient, this character can consider moving.
  const canMove = affCount > 1 && totalPop > 9; 

  // Determine if the character should act based on their role
  const actionChance = (role === 'National Leader' || role === 'National Deputy Leader' || role === 'State Leader') ? MOVEMENT_CHANCE_LEADER : MOVEMENT_CHANCE_REGULAR;
  if (Math.random() > actionChance) {
    return character;
  }
  
  // Decide between moving and making a statement
  // If population is low (<=1 affiliation member or <=9 total), heavily favor statement action since movement is blocked.
  const statementThreshold = canMove ? STATEMENT_ACTION_CHANCE : 0.8;

  if (Math.random() < statementThreshold) {
    return performStatementAction(character, role);
  }

  // If we reached here, the AI wants to move.
  // If they can't move due to population constraints, they idle (or did a statement above).
  if (!canMove) {
      return character;
  }

  // Existing movement logic
  if (role === 'National Leader' || role === 'National Deputy Leader') {
    return determineStrategicMove(character, allSeatCodes, allCharacters, featuresMap, demographicsMap, affiliationToPartyMap, affiliationsMap, strongholdMap);
  } else if (role === 'State Leader') {
    const stateSeatCodes = allSeatCodes.filter(sc => featuresMap.get(sc)?.properties.NEGERI === character.state);
    return determineStrategicMove(character, stateSeatCodes, allCharacters, featuresMap, demographicsMap, affiliationToPartyMap, affiliationsMap, strongholdMap);
  } else { // Member or State Executive
    return determineRegularAction(character, allSeatCodes, featuresMap, demographicsMap, affiliationsMap, strongholdMap);
  }
};
