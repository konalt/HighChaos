export interface GameSettings {
    physSteps: number;
    playerSpeed: number;
    updateRate: number;
    blockSize: number;
    gravity: number;
    jumpVelocity: number;
    playerTerminalVelocity: number;
    airControl: number;
    playerWidth: number;
    playerHeight: number;
    maxClientDesync: number;
    tickRate: number;
    ladderSpeed: number;
}

export let gameSettings: GameSettings = {
    playerSpeed: 20,
    ladderSpeed: 20,
    updateRate: 100,
    blockSize: 64,
    gravity: 1,
    jumpVelocity: 20,
    playerTerminalVelocity: 19,
    airControl: 1,
    playerHeight: 150,
    playerWidth: 75,
    maxClientDesync: 20,
    physSteps: 8,
    tickRate: 50,
};

export function setSettings(s: GameSettings) {
    gameSettings = s;
}
