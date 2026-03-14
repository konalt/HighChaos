import { GameSocket } from "./net/network";

export interface MoveData {
    hor: -1 | 0 | 1;
    jump: boolean;
}

export enum PlayerState {
    Active,
}

export interface Player {
    id: string;
    name: string;
    x: number;
    y: number;
    dx: number;
    dy: number;
    move: MoveData;
    state: PlayerState;
}

export let ply: Player;
export let socket: GameSocket;

export let textDecoder = new TextDecoder();

export function connect(): Promise<void> {
    return new Promise<void>((res, rej) => {
        socket = new GameSocket();
        socket.on("ack", () => {
            console.log("response received");
            res();
        });
    });
}
