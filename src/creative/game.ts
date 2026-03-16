import { Axis, deltaTime, getAxis } from "../lib/engine/engine";
import { GameSocket } from "./net/network";
import { AckPacket, PACKET } from "./net/packets";

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

export interface GameSettings {
    playerSpeed: number;
}

export let ply: Player;
export let socket: GameSocket;

export let players: Map<string, Player>;

export let gameSettings: GameSettings = {
    playerSpeed: 5,
};

export let textDecoder = new TextDecoder();
export let textEncoder = new TextEncoder();

export function connect(): Promise<void> {
    return new Promise<void>((res, rej) => {
        socket = new GameSocket();
        socket.on(PACKET.ACK, (packetStr) => {
            let packet: AckPacket = JSON.parse(packetStr);

            players = new Map();
            for (const [i, p] of packet.players) {
                players.set(i, p);
                if (i == socket.id) ply = p;
            }

            gameSettings = packet.settings;

            res();
        });
    });
}

let lastMove = 0;

export function localPlayerUpdate() {
    let dx = getAxis(Axis.Horizontal);
    ply.x += dx * gameSettings.playerSpeed * deltaTime;

    if (dx != lastMove) {
        socket.emit(PACKET.CS_PLAYER_MOVE, (dx + 1).toString());
        lastMove = dx;
    }
}
