
import { COLOR_PALETTE } from './constants';
import { Ethnicity, Party, Affiliation, PoliticalAlliance } from './types';

// Economic: 0 (Planned) - 100 (Market)
// Governance: 0 (Decentralized) - 100 (Centralized)

export const AFFILIATIONS: Affiliation[] = [
    // Malay Affiliations
    { id: 'malay-nat', name: 'Malay Nationalist', ethnicity: 'Malay', area: 'Rural', baseIdeology: { economic: 40, governance: 80 } },
    { id: 'malay-prog', name: 'Malay Progressive', ethnicity: 'Malay', area: 'Both', baseIdeology: { economic: 60, governance: 40 } },
    { id: 'malay-islamist', name: 'Islamist', ethnicity: 'Malay', area: 'Rural', baseIdeology: { economic: 30, governance: 90 } },
    { id: 'malay-socialist', name: 'Malay Socialist', ethnicity: 'Malay', area: 'Both', baseIdeology: { economic: 20, governance: 70 } },
    { id: 'malay-royalist', name: 'Malay Royalist', ethnicity: 'Malay', area: 'Both', baseIdeology: { economic: 50, governance: 85 } },
    { id: 'malay-civil', name: 'Malay Civil Service', ethnicity: 'Malay', area: 'Urban', baseIdeology: { economic: 50, governance: 90 } },
    { id: 'malay-biz', name: 'Malay Industrialist', ethnicity: 'Malay', area: 'Urban', baseIdeology: { economic: 85, governance: 60 } },
    { id: 'malay-edu', name: 'Malay Teachers', ethnicity: 'Malay', area: 'Urban', baseIdeology: { economic: 35, governance: 50 } },
    { id: 'malay-labour', name: 'Malay Trade Unionist', ethnicity: 'Malay', area: 'Urban', baseIdeology: { economic: 15, governance: 40 } },
    { id: 'malay-intel', name: 'Malay Intellectual', ethnicity: 'Malay', area: 'Urban', baseIdeology: { economic: 40, governance: 40 } },
    { id: 'malay-merchant', name: 'Malay Merchant Guild', ethnicity: 'Malay', area: 'Urban', baseIdeology: { economic: 80, governance: 50 } },
    { id: 'malay-professional', name: 'Malay Professionals', ethnicity: 'Malay', area: 'Urban', baseIdeology: { economic: 65, governance: 50 } },
    { id: 'malay-farmer', name: 'Malay Farmers Association', ethnicity: 'Malay', area: 'Rural', baseIdeology: { economic: 30, governance: 60 } },
    { id: 'malay-youth', name: 'Malay Youth Movement', ethnicity: 'Malay', area: 'Both', baseIdeology: { economic: 45, governance: 45 } },
    { id: 'malay-religious', name: 'Religious Scholars', ethnicity: 'Malay', area: 'Rural', baseIdeology: { economic: 25, governance: 95 } },
    { id: 'malay-veteran', name: 'Malay Veterans', ethnicity: 'Malay', area: 'Both', baseIdeology: { economic: 40, governance: 90 } },
    
    // Chinese Affiliations
    { id: 'chinese-biz', name: 'Chinese Industrialist', ethnicity: 'Chinese', area: 'Urban', baseIdeology: { economic: 95, governance: 60 } },
    { id: 'chinese-edu', name: 'Chinese Teachers', ethnicity: 'Chinese', area: 'Urban', baseIdeology: { economic: 40, governance: 40 } },
    { id: 'chinese-labour', name: 'Chinese Trade Unionist', ethnicity: 'Chinese', area: 'Urban', baseIdeology: { economic: 10, governance: 30 } },
    { id: 'chinese-intel', name: 'Chinese Intellectual', ethnicity: 'Chinese', area: 'Urban', baseIdeology: { economic: 45, governance: 35 } },
    { id: 'chinese-merchant', name: 'Chinese Merchant Guild', ethnicity: 'Chinese', area: 'Urban', baseIdeology: { economic: 90, governance: 50 } },
    { id: 'chinese-youth', name: 'Chinese Youth Wing', ethnicity: 'Chinese', area: 'Both', baseIdeology: { economic: 60, governance: 40 } },
    { id: 'chinese-professional', name: 'Chinese Professionals', ethnicity: 'Chinese', area: 'Urban', baseIdeology: { economic: 75, governance: 50 } },
    { id: 'chinese-chamber', name: 'Chinese Chamber of Commerce', ethnicity: 'Chinese', area: 'Urban', baseIdeology: { economic: 90, governance: 70 } },
    { id: 'chinese-clan', name: 'Chinese Clan Associations', ethnicity: 'Chinese', area: 'Both', baseIdeology: { economic: 70, governance: 80 } },
    { id: 'chinese-rural', name: 'Chinese Rural Community', ethnicity: 'Chinese', area: 'Rural', baseIdeology: { economic: 50, governance: 60 } },
    { id: 'chinese-progressive', name: 'Chinese Progressives', ethnicity: 'Chinese', area: 'Urban', baseIdeology: { economic: 55, governance: 30 } },
    
    // Indian Affiliations
    { id: 'indian-trad', name: 'Indian Traditionalist', ethnicity: 'Indian', area: 'Rural', baseIdeology: { economic: 40, governance: 75 } },
    { id: 'indian-reform', name: 'Indian Reformist', ethnicity: 'Indian', area: 'Both', baseIdeology: { economic: 50, governance: 35 } },
    { id: 'indian-prog', name: 'Indian Progressive', ethnicity: 'Indian', area: 'Urban', baseIdeology: { economic: 55, governance: 30 } },
    { id: 'indian-estate', name: 'Estate Workers Union', ethnicity: 'Indian', area: 'Rural', baseIdeology: { economic: 15, governance: 40 } },
    { id: 'indian-professional', name: 'Indian Professionals', ethnicity: 'Indian', area: 'Urban', baseIdeology: { economic: 65, governance: 50 } },
    { id: 'indian-merchant', name: 'Indian Merchants', ethnicity: 'Indian', area: 'Urban', baseIdeology: { economic: 85, governance: 50 } },
    { id: 'indian-youth', name: 'Indian Youth League', ethnicity: 'Indian', area: 'Both', baseIdeology: { economic: 45, governance: 40 } },
    { id: 'indian-labour', name: 'Indian Labour Movement', ethnicity: 'Indian', area: 'Urban', baseIdeology: { economic: 10, governance: 35 } },

];

export const PARTIES: Party[] = [
  { 
      id: 'umno', 
      name: 'UMNO', 
      color: COLOR_PALETTE[3], 
      affiliationIds: ['malay-nat', 'malay-prog','malay-royalist','malay-civil','malay-edu','malay-merchant','malay-professional', 'malay-youth', 'malay-veteran', 'malay-farmer', 'malay-biz','malay-intel', 'malay-religious', 'malay-farmer'], 
      deputyLeaderId: undefined, 
      stateBranches: [], 
      contestedSeats: new Map(), 
      leaderHistory: [], 
      ethnicityFocus: 'Malay', 
      relations: new Map(), 
      unity: 90, 
      ideology: { economic: 50, governance: 75 } 
  },
  { 
      id: 'mca', 
      name: 'MCA', 
      color: COLOR_PALETTE[2], 
      affiliationIds: ['chinese-biz', 'chinese-edu', 'chinese-merchant', 'chinese-chamber', 'chinese-clan', 'chinese-rural', 'chinese-youth', 'chinese-professional'], 
      deputyLeaderId: undefined, 
      stateBranches: [], 
      contestedSeats: new Map(), 
      leaderHistory: [], 
      ethnicityFocus: 'Chinese', 
      relations: new Map(), 
      unity: 85, 
      ideology: { economic: 80, governance: 60 } 
  },
  { 
      id: 'mic', 
      name: 'MIC', 
      color: COLOR_PALETTE[4], 
      affiliationIds: ['indian-trad', 'indian-reform', 'indian-prog', 'indian-estate', 'indian-professional', 'indian-merchant', 'indian-youth'], 
      deputyLeaderId: undefined, 
      stateBranches: [], 
      contestedSeats: new Map(), 
      leaderHistory: [], 
      ethnicityFocus: 'Indian', 
      relations: new Map(), 
      unity: 80, 
      ideology: { economic: 45, governance: 55 } 
  },
  { 
      id: 'pmip', 
      name: 'PMIP', 
      color: COLOR_PALETTE[1], 
      affiliationIds: ['malay-islamist'], 
      deputyLeaderId: undefined, 
      stateBranches: [], 
      contestedSeats: new Map(), 
      leaderHistory: [], 
      ethnicityFocus: 'Malay', 
      relations: new Map(), 
      unity: 95, 
      ideology: { economic: 35, governance: 85 } 
  },
  { 
      id: 'pr', 
      name: 'Parti Rakyat', 
      color: COLOR_PALETTE[17], 
      affiliationIds: ['malay-socialist'], 
      deputyLeaderId: undefined, 
      stateBranches: [], 
      contestedSeats: new Map(), 
      leaderHistory: [], 
      ethnicityFocus: 'Malay', 
      relations: new Map(), 
      unity: 70, 
      ideology: { economic: 20, governance: 50 }  
  },
  { 
      id: 'labour', 
      name: 'Labour Party', 
      color: COLOR_PALETTE[9], 
      affiliationIds: ['chinese-labour', 'chinese-intel', 'chinese-progressive', 'indian-labour','malay-labour'], 
      deputyLeaderId: undefined, 
      stateBranches: [], 
      contestedSeats: new Map(), 
      leaderHistory: [], 
      relations: new Map(), 
      unity: 75, 
      ideology: { economic: 20, governance: 30 } 
  },
];

export const INITIAL_ALLIANCES: PoliticalAlliance[] = [
    {
        id: 'alliance',
        name: 'The Alliance',
        memberPartyIds: ['umno', 'mca', 'mic'],
        type: 'Alliance',
        leaderPartyId: 'umno'
    }
];

export const getAffiliationsByEthnicity = (ethnicity: Ethnicity): Affiliation[] => {
  return AFFILIATIONS.filter(a => a.ethnicity === ethnicity);
};
