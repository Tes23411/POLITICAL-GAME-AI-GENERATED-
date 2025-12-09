
import { useState, useMemo } from 'react';
import { Character, Party, CharacterRole } from '../types';

export const usePlayer = (characters: Character[], parties: Party[]) => {
    const [playerCharacterId, setPlayerCharacterId] = useState<string | null>(null);
    const [playerPartyId, setPlayerPartyId] = useState<string | null>(null);

    const playerCharacter = useMemo(() => characters.find(c => c.id === playerCharacterId), [characters, playerCharacterId]);
    const playerParty = useMemo(() => parties.find(p => p.id === playerPartyId), [parties, playerPartyId]);

    const playerRoleInfo = useMemo(() => {
        if (!playerCharacter || !playerParty) return { role: 'Member', details: 'Member' } as { role: CharacterRole, details: string };
        
        if (playerParty.leaderId === playerCharacter.id) return { role: 'National Leader', details: 'Party Leader' } as { role: CharacterRole, details: string };
        if (playerParty.deputyLeaderId === playerCharacter.id) return { role: 'National Deputy Leader', details: 'Deputy Leader' } as { role: CharacterRole, details: string };
        
        const stateBranch = playerParty.stateBranches.find(b => b.leaderId === playerCharacter.id);
        if (stateBranch) return { role: 'State Leader', details: `State Leader (${stateBranch.state})` } as { role: CharacterRole, details: string };
        
        const isExec = playerParty.stateBranches.some(b => b.executiveIds.includes(playerCharacter.id));
        if (isExec) return { role: 'State Executive', details: 'State Executive' } as { role: CharacterRole, details: string };
        
        return { role: 'Member', details: 'Member' } as { role: CharacterRole, details: string };
    }, [playerCharacter, playerParty]);

    return { 
        playerCharacterId, 
        setPlayerCharacterId, 
        playerPartyId, 
        setPlayerPartyId, 
        playerCharacter, 
        playerParty, 
        playerRoleInfo 
    };
};
