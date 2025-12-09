
import { Character, Demographics, GeoJsonFeature, Affiliation, StrongholdMap } from '../types';

const URBAN_CONSTITUENCIES = new Set([
  "GEORGE TOWN", "KUALA LUMPUR BARAT", "KUALA LUMPUR TIMOR", "IPOH AND MENGLEMBU",
  "JOHORE BAHRU", "MALACCA CENTRAL", "SEREMBAN", "KINTA UTARA", "KINTA SELATAN",
  "PENANG ISLAND", "TELOK ANSON", "DINDINGS", "SELANGOR TENGAH", "LANGAT",
]);

const HOME_STATE_BONUS = 1.2;
const OUTSIDER_PENALTY = 0.8;
const BASELINE_APPEAL = 0.2; // Represents a character's appeal across ethnic lines (e.g., through party platform, general charisma).
const ETHNIC_ALIGNMENT_WEIGHT = 0.8; // Represents the portion of influence that is heavily dependent on shared ethnicity with voters.
const CANDIDATE_FOCUS_BONUS = 1.25;
const AFFILIATION_FOCUS_BONUS = 1.1;
const AREA_MATCH_BONUS = 1.2;
const AREA_MISMATCH_PENALTY = 0.8;
const STRONGHOLD_BONUS_PER_TERM = 0.1; // 10% per term

export const calculateEffectiveInfluence = (
  character: Character, 
  seat: GeoJsonFeature, 
  demographics: Demographics | null,
  affiliationsMap: Map<string, Affiliation>,
  strongholdMap: StrongholdMap,
  candidateId?: string | null,
  allocatedAffiliationId?: string | null
): number => {
  // Check if affiliation is suppressed by government crackdown
  const affiliation = affiliationsMap.get(character.affiliationId);
  if (affiliation?.isSuppressed) {
      return 0;
  }

  // Base power combines influence and recognition to represent a character's overall potential.
  const basePower = (character.influence * 0.8) + (character.recognition * 0.2);

  if (!seat.properties.NEGERI) {
    return Math.round(basePower);
  }

  // State bonus/penalty for being a local or outsider.
  const stateModifier = character.state === seat.properties.NEGERI 
    ? HOME_STATE_BONUS 
    : OUTSIDER_PENALTY;

  // Ethnicity modifier makes it much harder to win in a constituency where the party's/affiliation's target ethnicity is a small minority.
  // We use the Affiliation's ethnicity, not the character's, as influence comes from the political platform's support base.
  let ethnicityModifier = 1.0;
  if (demographics && affiliation) {
    const ethnicityKey = `${affiliation.ethnicity.toLowerCase()}Percent` as keyof Demographics;
    const supportPercent = (demographics[ethnicityKey] as number) || 0;
    
    // The modifier is a sum of a small baseline appeal and a larger, scaled appeal to the affiliation's ethnicity support.
    ethnicityModifier = BASELINE_APPEAL + (ETHNIC_ALIGNMENT_WEIGHT * (supportPercent / 100));
  }

  // Area (Urban/Rural) modifier
  const seatName = seat.properties.PARLIMEN;
  const isUrban = URBAN_CONSTITUENCIES.has(seatName);
  let areaModifier = 1.0;
  if (affiliation) {
      if (affiliation.area === 'Urban' && !isUrban) {
          areaModifier = AREA_MISMATCH_PENALTY;
      } else if (affiliation.area === 'Rural' && isUrban) {
          areaModifier = AREA_MISMATCH_PENALTY;
      } else if (affiliation.area === 'Urban' && isUrban) {
          areaModifier = AREA_MATCH_BONUS;
      } else if (affiliation.area === 'Rural' && !isUrban) { // Rural in Rural
          areaModifier = AREA_MATCH_BONUS;
      }
  }

  // Bonus if the character is the designated candidate or in the focused affiliation.
  let focusBonus = 1.0;
    if (candidateId && character.id === candidateId) {
        focusBonus = CANDIDATE_FOCUS_BONUS;
    } else if (allocatedAffiliationId && character.affiliationId === allocatedAffiliationId) {
        focusBonus = AFFILIATION_FOCUS_BONUS;
    }

  // Stronghold Bonus
  let strongholdBonus = 1.0;
  const stronghold = strongholdMap.get(seat.properties.UNIQUECODE);
  if (stronghold && stronghold.affiliationId === character.affiliationId) {
      strongholdBonus = 1.0 + (stronghold.terms * STRONGHOLD_BONUS_PER_TERM);
  }
  
  const effectiveInfluence = basePower * stateModifier * ethnicityModifier * focusBonus * areaModifier * strongholdBonus;
  
  return Math.round(Math.max(0, effectiveInfluence));
};