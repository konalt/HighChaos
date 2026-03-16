import { Axis, deltaTime, getAxis, setTargetFramerate } from "../lib/engine/engine";
import { lastPlayerUpdate, playerJoinHandler, playerLeaveHandler, playerUpdateHandler } from "./handlers";
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
    blockSize: number;
}

export let ply: Player;

export function setPly(p: Player) {
    ply = p;
}

export let socket: GameSocket;

export let players: Map<string, Player> = new Map();

export let gameSettings: GameSettings = {
    playerSpeed: 5,
    updateRate: 1000 / 60,
    blockSize: 80,
};

export let textDecoder = new TextDecoder();
export let textEncoder = new TextEncoder();

export function connect(): Promise<void> {
    return new Promise<void>((res, rej) => {
        socket = new GameSocket();
        socket.on(PACKET.SC_ACK, (packetStr) => {
            let packet: AckPacket = JSON.parse(packetStr);

            players = new Map();
            for (const [i, p] of packet.players) {
                addPlayer(p);
            }

            gameSettings = packet.settings;

            console.log(1000 / gameSettings.updateRate);

            setTargetFramerate(1000 / gameSettings.updateRate);

            socket.emit(PACKET.CS_PLAYER_JOIN);

            res();
        });

        socket.on(PACKET.SC_PLAYER_UPDATE, playerUpdateHandler);

        socket.on(PACKET.SC_PLAYER_JOIN, playerJoinHandler);
        socket.on(PACKET.SC_PLAYER_LEAVE, playerLeaveHandler);
    });
}

export function addPlayer(ply: Player) {
    let _p = ply;
    _p.old_x = 0;
    _p.old_y = 0;
    lastPlayerUpdate[ply.id] = 0;
    players.set(ply.id, _p);
    if (ply.id == socket.id) setPly(_p);
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
