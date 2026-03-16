import { Axis, deltaTime, getAxis, setTargetFramerate } from "../lib/engine/engine";
import { playerUpdateHandler } from "./handlers";
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
    old_x: number;
    old_y: number;
    move: MoveData;
    state: PlayerState;
}

export interface GameSettings {
    playerSpeed: number;
    updateRate: number;
}

export let ply: Player;
export let socket: GameSocket;

export let players: Map<string, Player>;

export let gameSettings: GameSettings = {
    playerSpeed: 5,
    updateRate: 1000 / 60,
};

export let textDecoder = new TextDecoder();
export let textEncoder = new TextEncoder();

export function connect(): Promise<void> {
    return new Promise<void>((res, rej) => {
        socket = new GameSocket();
        socket.on(PACKET.ACK, (packetStr) => {
            let packet: AckPacket = JSON.parse(packetStr);

            console.log(packet);

            players = new Map();
            for (const [i, p] of packet.players) {
                let _p = p;
                _p.old_x = 0;
                _p.old_y = 0;
                players.set(i, _p);
                if (i == socket.id) ply = _p;
            }

            gameSettings = packet.settings;

            console.log(1000 / gameSettings.updateRate);

            setTargetFramerate(1000 / gameSettings.updateRate);

            res();
        });

        socket.on(PACKET.SC_PLAYER_UPDATE, playerUpdateHandler);
    });
}

let lastMove = 0;

export function localPlayerUpdate() {
    let dx = getAxis(Axis.Horizontal);
    //ply.old_x = parseInt(ply.x.toString());
    ply.x += dx * gameSettings.playerSpeed * deltaTime;
    ply.old_x = ply.x;

    if (dx != lastMove) {
        socket.emit(PACKET.CS_PLAYER_MOVE, (dx + 1).toString());
        lastMove = dx;
    }
}
