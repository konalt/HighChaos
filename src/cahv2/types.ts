export interface CAHPlayer {
    id: string;
    name: string;
    isHost: boolean;
    cardsWhite: string[];
    cardsBlack: string[];
}

export enum CAHGameState {
    WaitingForPlayers,
    Countdown,
    Play,
    Slideshow,
    Voting,
    VoteSlideshow,
    Leaderboard,
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
}

export function deserializePlayer(data: string) {
    const parsed = JSON.parse(data);
    const player: CAHPlayer = {
        id: parsed.id,
        name: parsed.name,
        isHost: parsed.isHost,
        cardsBlack: parsed.cardsBlack,
        cardsWhite: parsed.cardsWhite,
    };
    return player;
}

export function deserializeGame(data: string) {
    const parsed = JSON.parse(data);
    const game: CAHGame = {
        players: new Map(),
        code: parsed.code,
        settings: parsed.settings,
        hostId: parsed.hostId,
        state: parsed.state,
    };
    for (const playerData of parsed.players) {
        const playerParsed = JSON.parse(playerData);
        game.players.set(playerParsed.id, playerParsed);
    }
    return game;
}
