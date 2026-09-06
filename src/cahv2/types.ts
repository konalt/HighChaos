import { loadImageAbsolute } from "../lib/engine/engine";
import { NULLTEXTURE } from "../lib/ui/hcimage";

export interface CAHPlayer {
    id: string;
    name: string;
    avatar: HTMLImageElement;
    isHost: boolean;
    cardsWhite: string[];
    cardsBlack: string[];
    chosenWhiteCard: string;
    voteTarget: string;
    votesReceived: number;
    score: number;
}

export enum CAHGameState {
    WaitingForPlayers,
    Countdown,
    Play,
    Vote,
    VoteResults,
}

export interface CAHGameSettings {
    maxPlayers: number;
    rounds: number;
    cardsToDeal: number;
    anonymousPlay: boolean;
    anonymousVote: boolean;
}

export interface CAHGame {
    players: Map<string, CAHPlayer>;
    code: string;
    settings: CAHGameSettings;
    state: CAHGameState;
    hostId: string;
    currentBlackCard: string;
}

export async function deserializePlayer(data: string) {
    const parsed = JSON.parse(data);
    const decodedAvatar = await loadImageAbsolute(parsed.avatarData);

    const player: CAHPlayer = {
        id: parsed.id,
        name: parsed.name,
        avatar: decodedAvatar,
        isHost: parsed.isHost,
        cardsBlack: parsed.cardsBlack,
        cardsWhite: parsed.cardsWhite,
        chosenWhiteCard: parsed.chosenWhiteCard,
        voteTarget: parsed.voteTarget,
        votesReceived: parsed.votesReceived,
        score: parsed.score,
    };
    return player;
}

export async function deserializeGame(data: string) {
    const parsed = JSON.parse(data);
    const game: CAHGame = {
        players: new Map(),
        code: parsed.code,
        settings: parsed.settings,
        hostId: parsed.hostId,
        state: parsed.state,
        currentBlackCard: parsed.currentBlackCard,
    };
    for (const playerData of parsed.players) {
        const playerParsed = await deserializePlayer(playerData);
        game.players.set(playerParsed.id, playerParsed);
    }
    return game;
}

export type CAHRoundResults = [string, number][];
