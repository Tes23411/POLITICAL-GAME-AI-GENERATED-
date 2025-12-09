
export type LatLngExpression = [number, number];

export interface City {
  id: number;
  name: string;
  position: LatLngExpression;
  description: string;
}

// GeoJSON Interfaces for map data
export interface GeoJsonGeometry {
  type: string;
  coordinates?: any; 
}

export interface GeoJsonProperties {
  [key: string]: any;
  isCombined?: boolean; // Flag to identify combined features
  originalFeatures?: GeoJsonFeature[]; // Store original features for splitting
}

export interface GeoJsonFeature {
  type: "Feature";
  properties: GeoJsonProperties;
  geometry: GeoJsonGeometry;
}

export type Ethnicity = 'Malay' | 'Chinese' | 'Indian';

export type AreaPreference = 'Urban' | 'Rural' | 'Both';

export interface Ideology {
  economic: number; // 0 = Planned, 100 = Free Market
  governance: number; // 0 = Decentralized, 100 = Centralized
}

export interface Affiliation {
  id: string;
  name: string;
  ethnicity: Ethnicity;
  area: AreaPreference;
  baseIdeology?: Ideology; // Static baseline for generation
  ideology?: Ideology; // Dynamic average of current members
  isSuppressed?: boolean;
  suppressedUntil?: Date;
}

export interface StatePartyBranch {
  state: string;
  leaderId?: string; // State Leader
  executiveIds: string[];
}

export interface Party {
  id: string;
  name: string;
  color: string;
  affiliationIds: string[];
  leaderId?: string; // National Leader
  deputyLeaderId?: string;
  stateBranches: StatePartyBranch[];
  contestedSeats: Map<string, { allocatedAffiliationId: string | null; candidateId: string | null; }>;
  leaderHistory: { leaderId: string; name: string; startDate: Date; endDate?: Date }[];
  ethnicityFocus?: Ethnicity;
  relations: Map<string, number>; // PartyID -> 0-100 Score
  unity: number; // 0-100, represents internal stability
  ideology: Ideology; // Average of affiliations
}

export type AllianceType = 'Alliance' | 'Pact';

export interface PoliticalAlliance {
  id: string;
  name: string;
  memberPartyIds: string[];
  type: AllianceType;
  leaderPartyId: string;
}

export interface CharacterHistoryEntry {
  date: Date;
  event: string;
}

export interface Character {
  id: string;
  name: string;
  currentSeatCode: string;
  affiliationId: string;
  ethnicity: Ethnicity;
  state: string; // Character's state of origin
  isPlayer?: boolean;
  charisma: number;
  influence: number;
  recognition: number;
  dateOfBirth: Date;
  isAlive: boolean;
  isAffiliationLeader?: boolean;
  isMP?: boolean;
  history: CharacterHistoryEntry[];
  ideology: Ideology;
}

export interface Demographics {
  uniqueCode: string;
  state: string;
  federalLegislativeCouncilCode: string;
  federalLegislativeCouncilName: string;
  totalElectorate: number;
  malayPercent: number;
  chinesePercent: number;
  indianPercent: number;
  othersPercent: number;
  [key: string]: string | number;
}

export type PlaySpeedValue = 2000 | 1000 | 500 | 250 | 125 | 50 | 25 | 5;
export type Speed = PlaySpeedValue | null;

export type GameState = 
  'start' | 
  'party-selection' | 
  'character-selection' | 
  'position-selection' | 
  'game' | 
  'election-results' | 
  'government-formation' |
  'party-election-voting' | 
  'party-election-results' |
  'affiliation-candidate-selection' |
  'parliament' |
  'speaker-election-voting' | 
  'speaker-election-results' |
  'bill-selection' |
  'bill-proposal' |
  'bill-results' |
  'secession-join-party' |
  'secession-new-party' |
  'party-merger'|
  'party-merger-result' |
  'alliance-creation' |
  'election-history'|
  'party-management' |
  'vote-of-confidence' |
  'event-modal';

export type ElectionResults = Map<string, string>; // seatCode -> partyId

export interface SeatWinner {
  partyId: string;
  candidateId: string;
  candidateName: string;
}

export interface SeatCandidateInfo {
    id: string;
    name: string;
}

export interface ElectionHistoryEntry {
  date: Date;
  results: ElectionResults;
  detailedResults: Map<string, Map<string, number>>;
  seatWinners: Map<string, SeatWinner>;
  seatCandidates: Map<string, Map<string, SeatCandidateInfo>>; // seatCode -> partyId -> CandidateInfo
  totalElectorate: number;
  totalVotes: number;
  totalSeats: number;
  alliances: PoliticalAlliance[];
  parties: Party[]; // Snapshot of parties at the time of election
}

export type ActionType = 
  'promoteParty' | 
  'addressLocal' | 
  'undermineRival' |
  'organizeStateRally' |
  'strengthenLocalBranch' |
  'secedeJoinParty' |
  'secedeNewParty' |
  'negotiatePartyMerger' |
  'inviteToParty' |
  'createAlliance' |
  'securityCrackdown';

export type PartyElectionVoteTally = Map<string, number>; // candidateId -> weightedVotes
export type SpeakerVoteTally = Map<string, number>; // candidateId -> votes
export type SpeakerVoteBreakdown = Map<string, string>; // partyId -> candidateId

export interface BillEffect {
    type: 'party_influence' | 'affiliation_recognition';
    targetId: string; // partyId or affiliationId
    value: number; // e.g., +5, -10
}

export interface Bill {
    id: string;
    title: string;
    description: string;
    proposingPartyId: string;
    effects: BillEffect[];
    tags: ('economic' | 'social' | 'religious' | 'nationalist' | 'constitutional' | 'progressive')[];
    isConstitutional?: boolean; // Requires 2/3 majority
}

export type VoteDirection = 'Aye' | 'Nay' | 'Abstain';
export type BillVoteBreakdown = Map<string, VoteDirection>; // partyId -> VoteDirection
export type BillVoteTally = { Aye: number; Nay: number; Abstain: number };

export type CharacterRole = 
  'Chief Minister' | 
  'Minister' | 
  'National Leader' | 
  'National Deputy Leader' | 
  'State Leader' | 
  'State Executive' | 
  'Member';

export interface Minister {
    ministerId: string;
    portfolio: string;
}

export interface Government {
    chiefMinisterId: string;
    rulingCoalitionIds: string[];
    cabinet: Minister[];
    formedDate: Date;
}

export interface VoteOfConfidenceResult {
    passed: boolean;
    votesFor: number;
    votesAgainst: number;
    breakdown: Map<string, 'For' | 'Against' | 'Abstain'>; // charId -> vote
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    date: Date;
    type: 'racial_tension' | 'economic' | 'scandal' | 'political' | 'crackdown_backlash';
    effects: string[];
    // Data required for application
    affectedSeatCodes?: string[];
    affectedPartyIds?: string[];
    affectedAffiliationIds?: string[];
    magnitude?: number;
}

export type LogType = 'major_event' | 'event' | 'politics' | 'election' | 'personal' | 'death';

export interface LogEntry {
    id: string;
    date: Date;
    title: string;
    description: string;
    type: LogType;
}

export interface SeatStronghold {
    affiliationId: string;
    terms: number;
}

export type StrongholdMap = Map<string, SeatStronghold>;

export interface PartyManagementScreenProps {
    party: Party;
    allParties: Party[]; // Needed to manage alliance members
    allSeatFeatures: GeoJsonFeature[];
    affiliationsMap: Map<string, Affiliation>;
    featuresMap: Map<string, GeoJsonFeature>;
    demographicsMap: Map<string, Demographics>;
    characters: Character[];
    currentDate: Date;
    onSave: (updatedParties: Party[]) => void; // Changed to accept array
    onClose: () => void;
    alliances: PoliticalAlliance[];
    strongholdMap: StrongholdMap;
}

export interface CharacterInfoPanelProps {
  character: Character;
  affiliation: Affiliation | undefined;
  party: Party | undefined;
  seat: GeoJsonFeature | undefined;
  onClose: () => void;
  currentDate: Date;
  roleInfo: { role: CharacterRole, details: string };
  isPlayerMoving: boolean;
  onInitiateMove: () => void;
  onCancelMove: () => void;
  onOpenPartyManagement: () => void;
  onOpenActions: () => void;
  onOpenAffiliationManagement: () => void;
  isPartyManagementDisabled?: boolean;
  partyManagementTooltip?: string;
  isAffiliationManagementDisabled?: boolean;
  affiliationManagementTooltip?: string;
  government?: Government | null;
}

export interface CharacterActionScreenProps {
    player: Character;
    onClose: () => void;
    onPerformAction: (action: ActionType, payload?: any) => void;
    characters: Character[];
    partiesMap: Map<string, Party>;
    affiliationToPartyMap: Map<string, string>;
    roleInfo: { role: CharacterRole, details: string };
    isAffiliationLeader: boolean;
    daysUntilElection: number;
    alliances: PoliticalAlliance[];
    government: Government | null;
}

export interface PartyElectionScreenProps {
  party: Party;
  candidates: Character[];
  affiliationsMap: Map<string, Affiliation>;
  onVote: (candidateId?: string) => void;
  isPlayerEligibleToVote: boolean;
}

export interface AllianceCreationScreenProps {
    playerParty: Party;
    parties: Party[];
    alliances: PoliticalAlliance[];
    onConfirm: (name: string, invitedPartyIds: string[], type: AllianceType) => void;
    onCancel: () => void;
}

export type UnificationMode = 'merge' | 'absorb';

export interface PartyMergerScreenProps {
  playerParty: Party;
  parties: Party[];
  affiliations: Affiliation[];
  characters: Character[];
  onPropose: (targets: { parties: Party[], affiliations: Affiliation[] }, newName: string) => void;
  onCancel: () => void;
  mode: UnificationMode;
}

export interface GovernmentFormationScreenProps {
    playerParty: Party;
    parties: Party[];
    electionResults: ElectionResults;
    totalSeats: number;
    alliances: PoliticalAlliance[];
    onConfirm: (coalitionIds: string[]) => void;
    onAuto: () => void;
}

export type ElectionSystem = 'FPTP' | 'PR';

export interface BillSelectionScreenProps {
    onSelect: (billTemplate: Omit<Bill, 'proposingPartyId'>) => void;
    onCancel: () => void;
}

export interface SpeakerElectionScreenProps {
  candidates: Character[];
  onVote: (candidateId: string) => void;
  partiesMap: Map<string, Party>;
  electionResults: ElectionResults;
  playerPartyId: string;
  isSpectator?: boolean;
}
