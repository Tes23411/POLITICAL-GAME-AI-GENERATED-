
import { useState } from 'react';
import { Government, Character, Bill, BillVoteTally, BillVoteBreakdown } from '../types';

export const useParliament = () => {
    const [government, setGovernment] = useState<Government | null>(null);
    const [speaker, setSpeaker] = useState<Character | null>(null);
    const [speakerCandidates, setSpeakerCandidates] = useState<Character[]>([]);
    const [speakerElectionResults, setSpeakerElectionResults] = useState<any>(null);
    const [currentBill, setCurrentBill] = useState<Bill | null>(null);
    const [billVoteResults, setBillVoteResults] = useState<{ passed: boolean; tally: BillVoteTally; breakdown: BillVoteBreakdown; } | null>(null);

    return {
        government,
        setGovernment,
        speaker,
        setSpeaker,
        speakerCandidates,
        setSpeakerCandidates,
        speakerElectionResults,
        setSpeakerElectionResults,
        currentBill,
        setCurrentBill,
        billVoteResults,
        setBillVoteResults
    };
};
