
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  GameState, Party, Character, ElectionResults, Affiliation, 
  Speed, PlaySpeedValue, ElectionHistoryEntry, LogEntry, Government, StrongholdMap, 
  PoliticalAlliance, ActionType, CharacterRole, VoteDirection,
  Bill, BillVoteTally, BillVoteBreakdown, GameEvent, LogType
} from './types';
import { 
    conductSpeakerVote, determineSpeakerCandidates,
    conductVoteOfConfidence,
    handleAffiliationSecession,
    handlePartyMerger,
    handlePartyAbsorption,
    attemptAllianceFormation,
    aiDecideBillVote,
    performSecurityCrackdown
} from './utils/politics';
import { applyEventEffects } from './utils/events';
import { populateWorldCharacters } from './utils/simulation';

// Components
import MapComponent from './components/MapComponent';
import GameControlPanel from './components/GameControlPanel';
import CharacterInfoPanel from './components/CharacterInfoPanel';
import PartyPanel from './components/PartyPanel';
import { ConstituencyPanel } from './components/ConstituencyPanel';
import EventLogPanel from './components/EventLogPanel';
import CountryInfoPanel from './components/CountryInfoPanel';
import PartyListPanel from './components/PartyListPanel';
import PlayerCharacterButton from './components/PlayerCharacterButton';
import EventModal from './components/EventModal';
import MergerResultModal from './components/MergerResultModal';
import EditorPanel from './components/EditorPanel';
import ElectionResultsPanel from './components/ElectionResultsPanel';
import SpeakerElectionResultsPanel from './components/SpeakerElectionResultsPanel';

// Screens
import StartScreen from './screens/StartScreen';
import CharacterSelectionScreen from './screens/CharacterSelectionScreen';
import PartySelectionScreen from './screens/PartySelectionScreen';
import PartyManagementScreen from './screens/PartyManagementScreen';
import CharacterActionScreen from './screens/CharacterActionScreen';
import ParliamentScreen from './screens/ParliamentScreen';
import ElectionHistoryScreen from './screens/ElectionHistoryScreen';
import AllianceCreationScreen from './screens/AllianceCreationScreen';
import PartyMergerScreen from './screens/PartyMergerScreen';
import SecessionJoinPartyScreen from './screens/SecessionJoinPartyScreen';
import SecessionNewPartyScreen from './screens/SecessionNewPartyScreen';
import BillSelectionScreen from './screens/BillSelectionScreen';
import SpeakerElectionScreen from './screens/SpeakerElectionScreen';

// Hooks
import { useGameTime } from './hooks/useGameTime';
import { useWorldData } from './hooks/useWorldData';
import { usePlayer } from './hooks/usePlayer';
import { useElection } from './hooks/useElection';
import { useParliament } from './hooks/useParliament';
import { useGameLoop } from './hooks/useGameLoop';

const INITIAL_DATE = new Date('1958-01-01');

const App: React.FC = () => {
    // --- State Management via Hooks ---
    const time = useGameTime(INITIAL_DATE);
    const world = useWorldData();
    const player = usePlayer(world.characters, world.parties);
    const election = useElection();
    const parliament = useParliament();
    
    const [gameState, setGameState] = useState<GameState>('start');
    const [pendingCharacter, setPendingCharacter] = useState<Partial<Character> | null>(null);
    
    // UI Panels
    const [showLog, setShowLog] = useState(false);
    const [showCountryInfo, setShowCountryInfo] = useState(false);
    const [showParliament, setShowParliament] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [showPartyList, setShowPartyList] = useState(false);
    
    // Interactions
    const [selectedSeatCode, setSelectedSeatCode] = useState<string | null>(null);
    const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isPlayerMoving, setIsPlayerMoving] = useState(false);
    
    // Modal State
    const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
    const [unreadLogCount, setUnreadLogCount] = useState(0);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [partyManagementOpen, setPartyManagementOpen] = useState(false);
    const [affiliationManagementOpen, setAffiliationManagementOpen] = useState<{ affiliation: Affiliation } | null>(null);
    const [mergerProposal, setMergerProposal] = useState<any>(null); 
    const [mergerResult, setMergerResult] = useState<any>(null);
    const [showBillSelection, setShowBillSelection] = useState(false);

    // --- Helpers ---
    const addLog = (title: string, description: string, type: LogType) => {
        const entry: LogEntry = {
            id: Date.now().toString(),
            date: new Date(time.currentDate),
            title,
            description,
            type
        };
        setLogEntries(prev => [entry, ...prev]);
        if (!showLog) setUnreadLogCount(prev => prev + 1);
    };

    // Derived state for map
    const latestDetailedElectionResults = useMemo(() => {
        if (election.electionHistory.length > 0) {
            return election.electionHistory[election.electionHistory.length - 1].detailedResults;
        }
        return new Map<string, Map<string, number>>();
    }, [election.electionHistory]);

    // --- Game Logic ---
    const handleGeneralElection = useCallback(() => {
        time.pause();
        const results = election.runGeneralElection(
            time.currentDate,
            world.seatFeatures,
            world.demographicsMap,
            world.parties,
            world.characters,
            world.affiliationsMap,
            world.strongholdMap,
            world.alliances,
            world.affiliationToPartyMap
        );

        election.setElectionResults(results.newElectionResults);
        parliament.setGovernment(results.newGov);
        election.setElectionHistory(prev => [...prev, results.historyEntry]);
        
        // Update MPs status
        const finalChars = results.govChars.map(c => {
             const winningSeat = Array.from(results.historyEntry.seatWinners.entries()).find(([code, win]) => win.candidateId === c.id);
             return { ...c, isMP: !!winningSeat };
        });
        world.setCharacters(finalChars);

        parliament.setSpeakerCandidates(results.speakerCandidates);
        election.setNextElectionDate(results.nextElectionDate);

        setGameState('election-results');
        addLog("General Election", `The ${results.historyEntry.date.getFullYear()} General Election has concluded.`, "election");

    }, [time, world, election, parliament]);

    // --- Core Game Loop ---
    useGameLoop({
        time,
        gameState,
        characters: world.characters,
        setCharacters: world.setCharacters,
        parties: world.parties,
        setParties: world.setParties,
        demographicsMap: world.demographicsMap,
        seatFeatures: world.seatFeatures,
        affiliationsMap: world.affiliationsMap,
        strongholdMap: world.strongholdMap,
        government: parliament.government,
        setGovernment: parliament.setGovernment,
        nextElectionDate: election.nextElectionDate,
        handleGeneralElection,
        onEventTriggered: (e) => setActiveEvent(e),
        addLog,
        affiliationToPartyMap: world.affiliationToPartyMap,
        partiesMap: world.partiesMap
    });

    const handleSpeakerElection = (playerVoteId: string) => {
        if (!parliament.speakerCandidates.length) return;

        const result = conductSpeakerVote(election.electionResults, world.parties, parliament.speakerCandidates, world.affiliationToPartyMap, player.playerPartyId || '', playerVoteId);
        const newSpeaker = world.characters.find(c => c.id === result.winnerId) || null;
        parliament.setSpeaker(newSpeaker);
        parliament.setSpeakerElectionResults({ winner: newSpeaker, tally: result.tally, breakdown: result.breakdown });
        setGameState('speaker-election-results');
        addLog("Speaker Elected", `${newSpeaker?.name} has been elected as the new Speaker of Parliament.`, "politics");
    };

    // --- Interactions ---

    const handleStartGame = () => {
        setGameState('party-selection');
    };

    const handlePartySelect = (party: Party) => {
        player.setPlayerPartyId(party.id);
        setGameState('character-selection');
    };
    
    const handleCharacterSelect = (charData: any) => {
        // Set pending character and switch to map for seat selection
        setPendingCharacter({
            ...charData,
            dateOfBirth: new Date('1920-01-01'),
            isAlive: true,
            ideology: world.affiliationsMap.get(charData.affiliationId)?.baseIdeology || { economic: 50, governance: 50 }
        });
        setGameState('position-selection');
    };
    
    const handlePositionSelect = (seatCode: string) => {
        if (!pendingCharacter) return;
        
        const newChar: Character = {
            ...(pendingCharacter as Character),
            currentSeatCode: seatCode
        };

        const worldChars = populateWorldCharacters(world.seatFeatures, world.demographicsMap, world.parties, world.affiliationsMap);
        
        world.setCharacters([newChar, ...worldChars]);
        player.setPlayerCharacterId(newChar.id);
        setPendingCharacter(null);
        setGameState('game');
        
        const seatName = world.seatFeatures.find(f => f.properties.UNIQUECODE === seatCode)?.properties.PARLIMEN || seatCode;
        addLog("Welcome", `You have started your journey as a politician in ${seatName}, ${newChar.state}.`, 'personal');
    };

    const handleSpectate = () => {
         const worldChars = populateWorldCharacters(world.seatFeatures, world.demographicsMap, world.parties, world.affiliationsMap);
         world.setCharacters(worldChars);
         setGameState('game');
         addLog("Spectator Mode", "Observing the political landscape.", "major_event");
    };

    const handleSeatClick = (seatCode: string | null) => {
        if (gameState === 'position-selection' && seatCode) {
            handlePositionSelect(seatCode);
            return;
        }

        if (isPlayerMoving && player.playerCharacter) {
             if (seatCode) {
                 const updatedChars = world.characters.map(c => 
                    c.id === player.playerCharacterId ? { ...c, currentSeatCode: seatCode } : c
                 );
                 world.setCharacters(updatedChars);
                 addLog("Movement", `Moved to ${world.seatFeatures.find(f => f.properties.UNIQUECODE === seatCode)?.properties.PARLIMEN}.`, 'personal');
                 setIsPlayerMoving(false);
                 setSelectedSeatCode(seatCode); // Select the new seat
             }
        } else {
            setSelectedSeatCode(seatCode);
        }
    };

    const handlePerformAction = (action: ActionType, payload?: any) => {
        setActionModalOpen(false);
        if (!player.playerCharacter) return;
        
        let updatedPlayer = { ...player.playerCharacter };
        
        switch(action) {
            case 'promoteParty':
                updatedPlayer.influence = Math.min(100, updatedPlayer.influence + 5);
                updatedPlayer.recognition = Math.min(100, updatedPlayer.recognition + 2);
                addLog('Action', `You promoted your party in ${world.seatFeatures.find(f => f.properties.UNIQUECODE === updatedPlayer.currentSeatCode)?.properties.PARLIMEN}.`, 'personal');
                world.setCharacters(prev => prev.map(c => c.id === updatedPlayer.id ? updatedPlayer : c));
                break;
            case 'addressLocal':
                updatedPlayer.influence = Math.min(100, updatedPlayer.influence + 8);
                updatedPlayer.recognition = Math.min(100, updatedPlayer.recognition + 4);
                addLog('Action', `You addressed local concerns.`, 'personal');
                world.setCharacters(prev => prev.map(c => c.id === updatedPlayer.id ? updatedPlayer : c));
                break;
             case 'strengthenLocalBranch':
                updatedPlayer.influence = Math.min(100, updatedPlayer.influence + 5);
                addLog('Action', `You strengthened the local branch.`, 'personal');
                world.setCharacters(prev => prev.map(c => c.id === updatedPlayer.id ? updatedPlayer : c));
                break;
             case 'organizeStateRally':
                updatedPlayer.influence = Math.min(100, updatedPlayer.influence + 10);
                updatedPlayer.recognition = Math.min(100, updatedPlayer.recognition + 5);
                addLog('Action', `You organized a major state rally.`, 'personal');
                world.setCharacters(prev => prev.map(c => c.id === updatedPlayer.id ? updatedPlayer : c));
                break;
            case 'undermineRival':
                 if (payload?.partyId) {
                     const rivalParty = world.partiesMap.get(payload.partyId);
                     addLog('Action', `You criticized ${rivalParty?.name}.`, 'personal');
                 }
                 break;
            case 'securityCrackdown':
                if (parliament.government) {
                    const result = performSecurityCrackdown(time.currentDate, world.characters, world.parties, parliament.government, world.affiliationsMap);
                    world.setCharacters(result.updatedCharacters);
                    world.setParties(result.updatedParties);
                    setActiveEvent(result.event);
                }
                break;
            case 'negotiatePartyMerger':
                setGameState('party-merger');
                setMergerProposal({ mode: 'merge' });
                break;
            case 'inviteToParty':
                setGameState('party-merger');
                setMergerProposal({ mode: 'absorb' });
                break;
            case 'createAlliance':
                setGameState('alliance-creation');
                break;
            case 'secedeJoinParty':
                setGameState('secession-join-party');
                break;
            case 'secedeNewParty':
                setGameState('secession-new-party');
                break;
        }
    };

    const handleAllianceConfirm = (name: string, invitedPartyIds: string[], type: any) => {
        if (!player.playerParty) return;
        const targetParties = invitedPartyIds.map(id => world.partiesMap.get(id)!).filter(Boolean);
        const result = attemptAllianceFormation(player.playerParty, targetParties, name, type, world.alliances);
        
        if (result.alliance) {
            world.setAlliances(prev => [...prev, result.alliance!]);
            addLog("Coalition Formed", `The ${result.alliance!.name} has been established.`, "politics");
        } else {
             addLog("Coalition Failed", "Negotiations for a new coalition collapsed.", "politics");
        }
        setGameState('game');
    };

    const handleSecessionJoin = (targetPartyId: string) => {
        if (!player.playerCharacter) return;
        const result = handleAffiliationSecession(
            world.parties, world.characters, election.electionResults, player.playerCharacter.affiliationId, player.playerCharacter, 'join', { targetPartyId }, time.currentDate,
            world.seatFeatures.map(f => f.properties.UNIQUECODE), 
            world.featuresMap,
            world.demographicsMap, world.affiliationsMap, world.strongholdMap
        );
        world.setParties(result.newParties);
        election.setElectionResults(result.newElectionResults);
        world.setCharacters(result.updatedCharacters);
        player.setPlayerPartyId(targetPartyId); // Update player party ref
        setGameState('game');
        addLog("Defection", `${player.playerCharacter.name} led their faction to join a new party.`, "major_event");
    };

    const handleSecessionNew = (name: string, focus: any) => {
        if (!player.playerCharacter) return;
        const result = handleAffiliationSecession(
            world.parties, world.characters, election.electionResults, player.playerCharacter.affiliationId, player.playerCharacter, 'new', { newPartyName: name }, time.currentDate,
            world.seatFeatures.map(f => f.properties.UNIQUECODE), 
            world.featuresMap,
            world.demographicsMap, world.affiliationsMap, world.strongholdMap, focus
        );
        world.setParties(result.newParties);
        election.setElectionResults(result.newElectionResults);
        world.setCharacters(result.updatedCharacters);
        // Find new party ID
        const newParty = result.newParties[result.newParties.length - 1];
        player.setPlayerPartyId(newParty.id);
        setGameState('game');
        addLog("New Party", `${newParty.name} has been founded by ${player.playerCharacter.name}.`, "major_event");
    };

    const handleMergerPropose = (targets: { parties: Party[], affiliations: Affiliation[] }, newName: string) => {
        if (!player.playerParty || !player.playerCharacter) return;
        
        // Simplified acceptance logic
        const acceptedParties: Party[] = [];
        const rejectedParties: Party[] = [];
        const acceptedAffs: Affiliation[] = [];
        const rejectedAffs: Affiliation[] = [];

        targets.parties.forEach(p => {
             if (Math.random() > 0.4) acceptedParties.push(p); else rejectedParties.push(p);
        });
        targets.affiliations.forEach(a => {
             if (Math.random() > 0.4) acceptedAffs.push(a); else rejectedAffs.push(a);
        });

        if (acceptedParties.length === 0 && acceptedAffs.length === 0) {
             setMergerResult({ accepted: [], rejected: [...rejectedParties, ...rejectedAffs], newName });
             setGameState('party-merger-result');
             return;
        }

        let result;
        if (mergerProposal.mode === 'merge') {
            result = handlePartyMerger(
                world.parties, player.playerParty.id, acceptedParties, acceptedAffs, newName, player.playerCharacter.id, undefined, 
                election.electionResults, world.characters, time.currentDate,
                world.seatFeatures.map(f => f.properties.UNIQUECODE),
                world.featuresMap,
                world.demographicsMap, world.affiliationsMap, world.strongholdMap
            );
            const newParty = result.newParties[result.newParties.length - 1]; 
            player.setPlayerPartyId(newParty.id);
        } else {
             result = handlePartyAbsorption(
                world.parties, player.playerParty.id, acceptedParties, acceptedAffs, 
                election.electionResults, world.characters, time.currentDate,
                world.seatFeatures.map(f => f.properties.UNIQUECODE),
                world.featuresMap,
                world.demographicsMap, world.affiliationsMap, world.strongholdMap
             );
        }

        world.setParties(result.newParties);
        election.setElectionResults(result.newElectionResults);
        world.setCharacters(result.updatedCharacters);
        
        setMergerResult({ accepted: [...acceptedParties, ...acceptedAffs], rejected: [...rejectedParties, ...rejectedAffs], newName });
        setGameState('party-merger-result');
        addLog("Party Restructuring", "Political landscape shifted due to new agreements.", "major_event");
    };

    const handleProposeBill = () => {
        setShowBillSelection(true);
    };

    const handleSelectBill = (billTemplate: any) => { // Type Omit<Bill, ...>
        if (!player.playerParty) return;
        const newBill: Bill = {
            ...billTemplate,
            proposingPartyId: player.playerParty.id
        };
        parliament.setCurrentBill(newBill);
        setShowBillSelection(false);
        setGameState('bill-proposal');
    };

    const handleVoteOnBill = (playerVote: VoteDirection) => {
        if (!parliament.currentBill) return;
        
        const tally = { Aye: 0, Nay: 0, Abstain: 0 };
        const breakdown = new Map<string, VoteDirection>();
        
        const mps = world.characters.filter(c => c.isMP && c.isAlive);
        
        mps.forEach(mp => {
            let vote: VoteDirection = 'Abstain';
            
            if (mp.id === player.playerCharacterId) {
                vote = playerVote;
            } else {
                 const partyId = world.affiliationToPartyMap.get(mp.affiliationId);
                 const party = partyId ? world.partiesMap.get(partyId) : undefined;
                 vote = aiDecideBillVote(party, parliament.currentBill!);
            }
            
            tally[vote]++;
            const pId = world.affiliationToPartyMap.get(mp.affiliationId);
            if (pId) breakdown.set(pId, vote); 
        });

        const totalVotes = tally.Aye + tally.Nay + tally.Abstain;
        const threshold = parliament.currentBill.isConstitutional ? Math.ceil(totalVotes * 2 / 3) : Math.floor(totalVotes / 2) + 1;
        const passed = tally.Aye >= threshold;

        parliament.setBillVoteResults({ passed, tally, breakdown });
        setGameState('bill-results');
        
        if (passed) {
            addLog("Bill Passed", `The ${parliament.currentBill.title} has been passed by Parliament.`, "politics");
        } else {
            addLog("Bill Defeated", `The ${parliament.currentBill.title} failed to pass.`, "politics");
        }
    };

    const handleCallVoteOfConfidence = () => {
        if (!parliament.government) return;
        const result = conductVoteOfConfidence(parliament.government, world.characters, world.parties, election.electionResults);
        
        if (result.passed) {
            addLog("Vote of Confidence", `The government survived the vote of confidence (${result.votesFor} vs ${result.votesAgainst}).`, "politics");
        } else {
            addLog("Government Collapse", `The government lost the vote of confidence (${result.votesFor} vs ${result.votesAgainst}) and has fallen.`, "major_event");
            parliament.setGovernment(null);
        }
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-900 text-white">
            {gameState === 'start' && <StartScreen onStart={handleStartGame} onSpectate={handleSpectate} isDataLoaded={world.seatFeatures.length > 0} />}
            {gameState === 'party-selection' && <PartySelectionScreen parties={world.parties} onPartySelect={handlePartySelect} />}
            {gameState === 'character-selection' && player.playerParty && (
                <CharacterSelectionScreen 
                    onCharacterSelect={handleCharacterSelect} 
                    party={player.playerParty} 
                    affiliationsMap={world.affiliationsMap}
                    uniqueStates={Array.from(new Set(world.seatFeatures.map(f => f.properties.NEGERI))).filter(Boolean) as string[]}
                />
            )}

            {gameState !== 'start' && gameState !== 'party-selection' && gameState !== 'character-selection' && (
                <>
                    <div className="flex-grow relative">
                        {gameState === 'position-selection' && (
                             <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full z-[5000] pointer-events-none border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                 <p className="text-lg font-bold animate-pulse">Select your starting constituency</p>
                             </div>
                        )}
                        <MapComponent 
                            features={world.seatFeatures}
                            characters={world.characters}
                            demographicsMap={world.demographicsMap}
                            parties={world.parties}
                            selectedSeatCode={selectedSeatCode}
                            onSeatClick={handleSeatClick}
                            affiliationToPartyMap={world.affiliationToPartyMap}
                            electionResults={election.electionResults}
                            isPlayerMoving={isPlayerMoving}
                            isPositionSelectionMode={gameState === 'position-selection'}
                            affiliationsMap={world.affiliationsMap}
                            strongholdMap={world.strongholdMap}
                            government={parliament.government}
                            detailedElectionResults={latestDetailedElectionResults} 
                        />

                        {selectedSeatCode && gameState !== 'position-selection' && (
                            <ConstituencyPanel 
                                seat={world.seatFeatures.find(f => f.properties.UNIQUECODE === selectedSeatCode)!}
                                demographics={world.demographicsMap.get(selectedSeatCode) || null}
                                characters={world.characters}
                                affiliationsMap={world.affiliationsMap}
                                partiesMap={world.partiesMap}
                                onClose={() => setSelectedSeatCode(null)}
                                onCharacterClick={(char) => setSelectedCharacter(char)}
                                affiliationToPartyMap={world.affiliationToPartyMap}
                                onPartyClick={(pid) => setSelectedPartyId(pid)}
                                electionHistory={election.electionHistory}
                                strongholdMap={world.strongholdMap}
                            />
                        )}

                        {selectedCharacter && gameState !== 'position-selection' && (
                            <CharacterInfoPanel 
                                character={selectedCharacter}
                                affiliation={world.affiliationsMap.get(selectedCharacter.affiliationId)}
                                party={world.parties.find(p => p.id === world.affiliationToPartyMap.get(selectedCharacter.affiliationId))}
                                seat={world.seatFeatures.find(f => f.properties.UNIQUECODE === selectedCharacter.currentSeatCode)}
                                onClose={() => setSelectedCharacter(null)}
                                currentDate={time.currentDate}
                                roleInfo={player.playerCharacter?.id === selectedCharacter.id ? player.playerRoleInfo : { role: 'Member', details: 'Member' }} 
                                isPlayerMoving={isPlayerMoving}
                                onInitiateMove={() => { setIsPlayerMoving(true); setSelectedCharacter(null); setSelectedSeatCode(null); }}
                                onCancelMove={() => setIsPlayerMoving(false)}
                                onOpenPartyManagement={() => setPartyManagementOpen(true)}
                                onOpenActions={() => setActionModalOpen(true)}
                                onOpenAffiliationManagement={() => setAffiliationManagementOpen({ affiliation: world.affiliationsMap.get(selectedCharacter.affiliationId)! })}
                                government={parliament.government}
                            />
                        )}
                        
                        {selectedPartyId && (
                            <PartyPanel 
                                party={world.parties.find(p => p.id === selectedPartyId)!}
                                members={world.characters.filter(c => world.parties.find(p => p.id === selectedPartyId)?.affiliationIds.includes(c.affiliationId))}
                                affiliationsMap={world.affiliationsMap}
                                featuresMap={world.featuresMap}
                                demographicsMap={world.demographicsMap}
                                onClose={() => setSelectedPartyId(null)}
                                onCharacterClick={(char) => setSelectedCharacter(char)}
                                strongholdMap={world.strongholdMap}
                            />
                        )}
                        
                        {showLog && <EventLogPanel logEntries={logEntries} onClose={() => setShowLog(false)} />}
                        {showCountryInfo && <CountryInfoPanel demographicsMap={world.demographicsMap} onClose={() => setShowCountryInfo(false)} />}
                        
                        {showPartyList && (
                             <PartyListPanel 
                                parties={world.parties} 
                                affiliationsMap={world.affiliationsMap} 
                                onClose={() => setShowPartyList(false)}
                                onPartyClick={(pid) => setSelectedPartyId(pid)}
                            />
                        )}
                        
                        {gameState === 'election-results' && election.electionHistory.length > 0 && (
                            <ElectionResultsPanel
                                results={election.electionResults}
                                previousResults={election.electionHistory.length > 1 ? election.electionHistory[election.electionHistory.length - 2].results : new Map()}
                                detailedResults={latestDetailedElectionResults}
                                previousDetailedResults={election.electionHistory.length > 1 ? election.electionHistory[election.electionHistory.length - 2].detailedResults : null}
                                partiesMap={world.partiesMap}
                                totalSeats={world.seatFeatures.length}
                                onClose={() => setGameState('speaker-election-voting')}
                                electionDate={election.electionHistory[election.electionHistory.length - 1].date}
                                totalElectorate={election.electionHistory[election.electionHistory.length - 1].totalElectorate}
                                alliances={world.alliances}
                            />
                        )}

                        {gameState === 'speaker-election-voting' && (
                            <SpeakerElectionScreen 
                                candidates={parliament.speakerCandidates}
                                onVote={handleSpeakerElection}
                                partiesMap={world.partiesMap}
                                electionResults={election.electionResults}
                                playerPartyId={player.playerPartyId || ''}
                                isSpectator={!player.playerPartyId}
                            />
                        )}

                        {gameState === 'speaker-election-results' && parliament.speakerElectionResults && (
                            <SpeakerElectionResultsPanel 
                                results={parliament.speakerElectionResults}
                                partiesMap={world.partiesMap}
                                characters={world.characters}
                                onClose={() => { setGameState('game'); parliament.setSpeakerElectionResults(null); }}
                            />
                        )}

                        {election.electionHistory.length > 0 && gameState === 'election-history' && (
                             <ElectionHistoryScreen 
                                history={election.electionHistory} 
                                partiesMap={world.partiesMap} 
                                totalSeats={world.seatFeatures.length} 
                                onClose={() => setGameState('game')}
                                electionHistory={election.electionHistory}
                             />
                        )}

                        {player.playerCharacter && !selectedCharacter && gameState !== 'position-selection' && (
                            <PlayerCharacterButton player={player.playerCharacter} onClick={() => setSelectedCharacter(player.playerCharacter)} />
                        )}

                        {/* Modals */}
                        {activeEvent && (
                            <EventModal 
                                event={activeEvent} 
                                onAcknowledge={() => { 
                                    const { updatedCharacters, updatedParties } = applyEventEffects(activeEvent, world.characters, world.parties, world.affiliationsMap);
                                    world.setCharacters(updatedCharacters);
                                    world.setParties(updatedParties);
                                    let logType: LogType = 'event';
                                    if (activeEvent.type === 'racial_tension' || activeEvent.type === 'crackdown_backlash' || activeEvent.type === 'economic') {
                                        logType = 'major_event';
                                    } else {
                                        logType = 'politics';
                                    }
                                    addLog(activeEvent.title, activeEvent.description, logType);
                                    setActiveEvent(null); 
                                    time.play();
                                }} 
                            />
                        )}
                        
                        {showParliament && (
                            <div className="absolute top-0 left-0 bottom-0 z-[2000]">
                                <ParliamentScreen 
                                    gameState={gameState}
                                    electionResults={election.electionResults}
                                    partiesMap={world.partiesMap}
                                    totalSeats={world.seatFeatures.length}
                                    speaker={parliament.speaker}
                                    onClose={() => setShowParliament(false)}
                                    currentBill={parliament.currentBill}
                                    playerParty={player.playerParty || null}
                                    billVoteResults={parliament.billVoteResults}
                                    onVoteOnBill={handleVoteOnBill}
                                    onCloseBillResults={() => parliament.setBillVoteResults(null)}
                                    government={parliament.government}
                                    characters={world.characters}
                                    onCallVoteOfConfidence={handleCallVoteOfConfidence}
                                    onProposeBill={handleProposeBill}
                                />
                            </div>
                        )}
                        
                        {showBillSelection && (
                            <BillSelectionScreen 
                                onSelect={handleSelectBill} 
                                onCancel={() => setShowBillSelection(false)} 
                            />
                        )}
                        
                        {showEditor && (
                            <EditorPanel 
                                currentDate={time.currentDate}
                                setCurrentDate={time.setCurrentDate}
                                setNextElectionDate={election.setNextElectionDate}
                                parties={world.parties}
                                setParties={world.setParties}
                                characters={world.characters}
                                setCharacters={world.setCharacters}
                                affiliationsMap={world.affiliationsMap}
                                onClose={() => setShowEditor(false)}
                            />
                        )}

                        {actionModalOpen && player.playerCharacter && (
                            <CharacterActionScreen 
                                player={player.playerCharacter}
                                onClose={() => setActionModalOpen(false)}
                                onPerformAction={handlePerformAction}
                                characters={world.characters}
                                partiesMap={world.partiesMap}
                                affiliationToPartyMap={world.affiliationToPartyMap}
                                roleInfo={player.playerRoleInfo}
                                isAffiliationLeader={player.playerCharacter.isAffiliationLeader || false}
                                daysUntilElection={Math.ceil((election.nextElectionDate.getTime() - time.currentDate.getTime()) / (1000 * 60 * 60 * 24))}
                                alliances={world.alliances}
                                government={parliament.government}
                            />
                        )}

                        {gameState === 'alliance-creation' && player.playerParty && (
                            <AllianceCreationScreen 
                                playerParty={player.playerParty}
                                parties={world.parties}
                                alliances={world.alliances}
                                onConfirm={handleAllianceConfirm}
                                onCancel={() => setGameState('game')}
                            />
                        )}

                        {gameState === 'party-merger' && player.playerParty && (
                             <PartyMergerScreen 
                                playerParty={player.playerParty}
                                parties={world.parties}
                                affiliations={Array.from(world.affiliationsMap.values())}
                                characters={world.characters}
                                onPropose={handleMergerPropose}
                                onCancel={() => setGameState('game')}
                                mode={mergerProposal?.mode || 'merge'}
                             />
                        )}

                        {gameState === 'party-merger-result' && mergerResult && (
                             <MergerResultModal 
                                result={mergerResult}
                                onClose={() => { setMergerResult(null); setGameState('game'); }}
                             />
                        )}

                        {gameState === 'secession-join-party' && player.playerCharacter && player.playerPartyId && (
                            <SecessionJoinPartyScreen 
                                parties={world.parties}
                                currentPartyId={player.playerPartyId}
                                affiliation={world.affiliationsMap.get(player.playerCharacter.affiliationId)!}
                                onSelect={handleSecessionJoin}
                                onCancel={() => setGameState('game')}
                            />
                        )}

                        {gameState === 'secession-new-party' && player.playerCharacter && (
                            <SecessionNewPartyScreen 
                                affiliation={world.affiliationsMap.get(player.playerCharacter.affiliationId)!}
                                onConfirm={handleSecessionNew}
                                onCancel={() => setGameState('game')}
                            />
                        )}
                        
                        {partyManagementOpen && player.playerParty && (
                             <PartyManagementScreen 
                                party={player.playerParty}
                                allParties={world.parties}
                                allSeatFeatures={world.seatFeatures}
                                affiliationsMap={world.affiliationsMap}
                                featuresMap={world.featuresMap}
                                demographicsMap={world.demographicsMap}
                                characters={world.characters}
                                currentDate={time.currentDate}
                                onSave={(updatedParties) => {
                                    const newParties = world.parties.map(p => {
                                        const update = updatedParties.find(up => up.id === p.id);
                                        return update || p;
                                    });
                                    world.setParties(newParties);
                                    setPartyManagementOpen(false);
                                    addLog("Party Management", "Party strategies and allocations updated.", "politics");
                                }}
                                onClose={() => setPartyManagementOpen(false)}
                                alliances={world.alliances}
                                strongholdMap={world.strongholdMap}
                             />
                        )}
                    </div>

                    <GameControlPanel 
                        currentDate={time.currentDate}
                        currentSpeed={time.speed}
                        onSpeedChange={time.setSpeed}
                        onPlay={time.play}
                        onPause={time.pause}
                        nextElectionDate={election.nextElectionDate}
                        onShowParliament={() => setShowParliament(true)}
                        electionHappened={election.electionHistory.length > 0}
                        onOpenHistory={() => setGameState('election-history')}
                        isElectionClose={(election.nextElectionDate.getTime() - time.currentDate.getTime()) < 30 * 24 * 60 * 60 * 1000}
                        onOpenParties={() => setShowPartyList(!showPartyList)}
                        observeMode={player.playerCharacterId === null}
                        onToggleObserveMode={() => {}} 
                        onToggleLog={() => setShowLog(!showLog)}
                        unreadLogCount={unreadLogCount}
                        onOpenCountryInfo={() => setShowCountryInfo(true)}
                    />
                </>
            )}
        </div>
    );
};

export default App;
