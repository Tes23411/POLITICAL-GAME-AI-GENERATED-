
import { useState } from 'react';
import { ElectionResults, ElectionHistoryEntry, Party, Character, PoliticalAlliance, GeoJsonFeature, Demographics, Affiliation, StrongholdMap } from '../types';
import { calculateEffectiveInfluence } from '../utils/influence';
import { formGovernment, determineSpeakerCandidates } from '../utils/politics';

export const useElection = () => {
    const [nextElectionDate, setNextElectionDate] = useState<Date>(new Date('1959-08-19'));
    const [electionResults, setElectionResults] = useState<ElectionResults>(new Map());
    const [electionHistory, setElectionHistory] = useState<ElectionHistoryEntry[]>([]);
    
    const runGeneralElection = (
        currentDate: Date,
        seatFeatures: GeoJsonFeature[],
        demographicsMap: Map<string, Demographics>,
        parties: Party[],
        characters: Character[],
        affiliationsMap: Map<string, Affiliation>,
        strongholdMap: StrongholdMap,
        alliances: PoliticalAlliance[],
        affiliationToPartyMap: Map<string, string>
    ) => {
        const newElectionResults: ElectionResults = new Map();
        const seatWinners = new Map<string, any>();
        const seatCandidates = new Map<string, Map<string, any>>();
        const detailedResults = new Map<string, Map<string, number>>();
        
        seatFeatures.forEach(seat => {
            const seatCode = seat.properties.UNIQUECODE;
            const demographics = demographicsMap.get(seatCode);
            const votesMap = new Map<string, number>(); 
            const totalVoters = demographics ? demographics.totalElectorate : 10000;
            
            const partyScores = new Map<string, number>();
            let totalScore = 0;

            parties.forEach(party => {
                let score = 0;
                // Base Party Appeal from Unity
                score += party.unity / 2; 
                
                // Candidate Influence
                const candidatesInSeat = characters.filter(c => c.currentSeatCode === seatCode && affiliationToPartyMap.get(c.affiliationId) === party.id && c.isAlive);
                let bestCandidate = null;
                let maxInf = 0;
                
                candidatesInSeat.forEach(c => {
                     const contest = party.contestedSeats.get(seatCode);
                     const isOfficial = contest && contest.candidateId === c.id;
                     
                     let inf = calculateEffectiveInfluence(c, seat, demographics || null, affiliationsMap, strongholdMap);
                     if (isOfficial) inf *= 1.5; 
                     
                     if (inf > maxInf) {
                         maxInf = inf;
                         bestCandidate = c;
                     }
                });
                
                if (bestCandidate) {
                    score += maxInf;
                     if (!seatCandidates.has(seatCode)) seatCandidates.set(seatCode, new Map());
                     seatCandidates.get(seatCode)!.set(party.id, { id: bestCandidate!.id, name: bestCandidate!.name });
                } else {
                    score += 5; // Minimal presence
                }

                // Demographic Alignment
                if (demographics && party.ethnicityFocus) {
                     if (party.ethnicityFocus === 'Malay') score += demographics.malayPercent;
                     else if (party.ethnicityFocus === 'Chinese') score += demographics.chinesePercent;
                     else if (party.ethnicityFocus === 'Indian') score += demographics.indianPercent;
                } else {
                     score += 40; // Multi-ethnic base appeal
                }
                
                // Alliance Buff
                const alliance = alliances.find(a => a.memberPartyIds.includes(party.id));
                if (alliance) score *= 1.1;

                // Random Factor for variability
                score *= (0.8 + Math.random() * 0.4);
                
                partyScores.set(party.id, score);
                totalScore += score;
            });

            // Convert scores to votes
            let winnerId = '';
            let maxVotes = -1;
            
            parties.forEach(party => {
                const score = partyScores.get(party.id) || 0;
                const voteShare = totalScore > 0 ? score / totalScore : 0;
                const votes = Math.round(voteShare * totalVoters);
                votesMap.set(party.id, votes);
                
                if (votes > maxVotes) {
                    maxVotes = votes;
                    winnerId = party.id;
                }
            });
            
            if (winnerId) {
                newElectionResults.set(seatCode, winnerId);
                const winningCandidateInfo = seatCandidates.get(seatCode)?.get(winnerId);
                seatWinners.set(seatCode, {
                    partyId: winnerId,
                    candidateId: winningCandidateInfo?.id || '',
                    candidateName: winningCandidateInfo?.name || 'Unknown'
                });
            }
            detailedResults.set(seatCode, votesMap);
        });

        // Form Government
        const { government: newGov, updatedCharacters: govChars } = formGovernment(
            newElectionResults, parties, characters, currentDate, alliances
        );

        // Prepare Speaker Election Candidates
        const speakerCandidates = determineSpeakerCandidates(newElectionResults, parties, govChars);

        // Update History
        const historyEntry: ElectionHistoryEntry = {
            date: new Date(currentDate),
            results: newElectionResults,
            detailedResults: detailedResults,
            seatWinners: seatWinners,
            seatCandidates: seatCandidates,
            totalElectorate: Array.from(demographicsMap.values()).reduce((sum, d) => sum + d.totalElectorate, 0),
            totalVotes: Array.from(detailedResults.values()).reduce((sum, map) => sum + Array.from(map.values()).reduce((a, b) => a + b, 0), 0),
            totalSeats: seatFeatures.length,
            alliances: JSON.parse(JSON.stringify(alliances)),
            parties: JSON.parse(JSON.stringify(parties))
        };
        
        // Schedule next election
        const next = new Date(currentDate);
        next.setFullYear(next.getFullYear() + 4);

        return { 
            newElectionResults, 
            newGov, 
            govChars, 
            speakerCandidates, 
            historyEntry, 
            nextElectionDate: next 
        };
    };

    return { 
        nextElectionDate, 
        setNextElectionDate, 
        electionResults, 
        setElectionResults, 
        electionHistory, 
        setElectionHistory,
        runGeneralElection
    };
};
