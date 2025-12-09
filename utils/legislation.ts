

import { Bill, Party } from '../types';

export const BILLS: Omit<Bill, 'proposingPartyId'>[] = [
    {
        id: 'edu_reform_1',
        title: 'Vernacular School Funding Act',
        description: 'A bill to increase federal funding for Chinese and Tamil vernacular schools to ensure equitable educational resources across all communities.',
        effects: [
            { type: 'affiliation_recognition', targetId: 'chinese-edu', value: 10 },
            { type: 'affiliation_recognition', targetId: 'indian-reform', value: 5 },
            { type: 'party_influence', targetId: 'mca', value: 5 },
            { type: 'party_influence', targetId: 'mic', value: 3 },
            { type: 'party_influence', targetId: 'umno', value: -5 },
            { type: 'party_influence', targetId: 'pmip', value: -3 },
        ],
        tags: ['social'],
        isConstitutional: false
    },
    {
        id: 'islamic_law_1',
        title: 'Sharia Courts Enhancement Bill',
        description: 'This bill proposes to expand the jurisdiction of Sharia courts in matters of family law for the Muslim population.',
        effects: [
            { type: 'affiliation_recognition', targetId: 'malay-islamist', value: 15 },
            { type: 'party_influence', targetId: 'pmip', value: 8 },
            { type: 'party_influence', targetId: 'umno', value: 3 },
            { type: 'party_influence', targetId: 'mca', value: -4 },
            { type: 'party_influence', targetId: 'labour', value: -5 },
        ],
        tags: ['religious', 'social'],
        isConstitutional: false
    },
    {
        id: 'nat_security_1',
        title: 'Internal Security Act',
        description: 'A bill to grant the government powers to detain individuals without trial to prevent subversive activities and ensure national security.',
        effects: [
            { type: 'party_influence', targetId: 'umno', value: 7 },
            { type: 'party_influence', targetId: 'labour', value: -10 },
            { type: 'party_influence', targetId: 'pr', value: -8 },
        ],
        tags: ['nationalist'],
        isConstitutional: false
    },
    {
        id: 'const_redelineation',
        title: 'Constitutional Amendment: Constituency Redelineation',
        description: 'A constitutional amendment to redraw electoral boundaries, creating more rural constituencies to better represent the agrarian populace. Requires 2/3 majority.',
        effects: [
            { type: 'party_influence', targetId: 'umno', value: 10 },
            { type: 'party_influence', targetId: 'pmip', value: 5 },
            { type: 'party_influence', targetId: 'labour', value: -10 },
            { type: 'affiliation_recognition', targetId: 'chinese-urban', value: -5 },
        ],
        tags: ['constitutional', 'nationalist'],
        isConstitutional: true
    },
    {
        id: 'const_language',
        title: 'National Language Act Amendment',
        description: 'An amendment to enshrine the national language as the sole language for all official purposes, including courts and education. Requires 2/3 majority.',
        effects: [
            { type: 'affiliation_recognition', targetId: 'malay-nat', value: 20 },
             { type: 'party_influence', targetId: 'umno', value: 5 },
            { type: 'party_influence', targetId: 'mca', value: -10 },
            { type: 'party_influence', targetId: 'mic', value: -8 },
        ],
        tags: ['constitutional', 'nationalist', 'social'],
        isConstitutional: true
    }
];

export const generateBill = (parties: Party[]): Bill => {
    // 10% chance for a constitutional bill
    const isConstitutional = Math.random() < 0.1;
    let pool = BILLS.filter(b => !!b.isConstitutional === isConstitutional);
    
    if (pool.length === 0) pool = BILLS;

    const billTemplate = pool[Math.floor(Math.random() * pool.length)];
    // A real system would have dynamic proposing parties based on government status
    // For now, assume ruling party or random large party proposes
    const sortedParties = [...parties].sort((a,b) => (b.relations.size) - (a.relations.size)); // Simple heuristic
    const proposingParty = sortedParties[0];
    
    return { ...billTemplate, proposingPartyId: proposingParty.id };
}