import { Axis, deltaTime, getAxis, getKeyDown, setTargetFramerate, since } from "../lib/engine/engine";
import { FourNums } from "../lib/engine/utils";
import { checkBlockIntersection } from "./collision";
import {
    ackHandler,
    blockRemoveHandler,
    blockUpdateHandler,
    chatClearHandler,
    chatHandler,
    lastPlayerUpdate,
    pingSendHandler,
    pingTableHandler,
    playerJoinHandler,
    playerLeaveHandler,
    playerUpdateHandler,
} from "./handlers";
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
    grounded: boolean;
}

export let ply: Player;

export enum Block {
    DIRT,
    GRASS,
    STONE,
}

export class BlockStruct {
    type: Block = Block.DIRT;
    gx: number = 0;
    gy: number = 0;

    constructor() {}
}

export function setPly(p: Player) {
    ply = p;
}

export let socket: GameSocket;

export let players: Map<string, Player> = new Map();
export let blocks: BlockStruct[] = [];

export function setBlocks(bs: BlockStruct[]) {
    blocks = bs;
}

export function setBlock(bs: BlockStruct) {
    let cBlock = blocks.find((b) => b.gx == bs.gx && b.gy == bs.gy);

    if (cBlock) {
        cBlock = bs;
    } else {
        blocks.push(bs);
    }
}

export function removeBlock(x: number, y: number) {
    blocks = blocks.filter((b) => b.gx != x || b.gy != y);
}

export interface GameSettings {
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
}

export let gameSettings: GameSettings = {
    playerSpeed: 20,
    updateRate: 100,
    blockSize: 64,
    gravity: 1,
    jumpVelocity: 20,
    playerTerminalVelocity: 19,
    airControl: 1,
    playerHeight: 150,
    playerWidth: 75,
    maxClientDesync: 20,
};

export function setSettings(s: GameSettings) {
    gameSettings = s;
}

export let messages: [string, string][];
export function setMessages(m: [string, string][]) {
    messages = m;
}

export let pingTable: Record<string, number> = {};
export function setPingTable(t: Record<string, number>) {
    pingTable = t;
}

export let textDecoder = new TextDecoder();
export let textEncoder = new TextEncoder();

export function connect(): Promise<void> {
    return new Promise<void>((res, rej) => {
        socket = new GameSocket();
        socket.on(PACKET.SC_ACK, (packetStr) => {
            ackHandler(packetStr);

            res();
        });

        socket.on(PACKET.SC_PLAYER_UPDATE, playerUpdateHandler);

        socket.on(PACKET.SC_PLAYER_JOIN, playerJoinHandler);
        socket.on(PACKET.SC_PLAYER_LEAVE, playerLeaveHandler);

        socket.on(PACKET.SC_PING_SEND, pingSendHandler);
        socket.on(PACKET.SC_PING_TABLE, pingTableHandler);

        socket.on(PACKET.SC_CHAT_RECV, chatHandler);
        socket.on(PACKET.SC_CHAT_CLEAR, chatClearHandler);

        socket.on(PACKET.SC_BLOCK_UPDATE, blockUpdateHandler);
        socket.on(PACKET.SC_BLOCK_REMOVE, blockRemoveHandler);
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
    const _ply = { ...ply };

    let dx = getAxis(Axis.Horizontal);

    ply.old_x = parseInt(ply.x.toString());
    ply.x += dx * gameSettings.playerSpeed * deltaTime;
    let plyRect: FourNums = [
        ply.x - gameSettings.playerWidth / 2,
        ply.y - gameSettings.playerHeight,
        gameSettings.playerWidth,
        gameSettings.playerHeight,
    ];
    let check = checkBlockIntersection(plyRect);
    if (check) {
        ply.x = _ply.x;
    }

    ply.old_y = parseInt(ply.y.toString());
    ply.dy += gameSettings.gravity * deltaTime;
    if (ply.dy > gameSettings.playerTerminalVelocity) ply.dy = gameSettings.playerTerminalVelocity;
    ply.y += ply.dy * deltaTime;

    plyRect = [
        ply.x - gameSettings.playerWidth / 2,
        ply.y - gameSettings.playerHeight,
        gameSettings.playerWidth,
        gameSettings.playerHeight,
    ];
    check = checkBlockIntersection(plyRect);
    if (check) {
        ply.dy = 0;
        ply.y = -check.gy * gameSettings.blockSize;
    }

    if (ply.y > 5 * gameSettings.blockSize) {
        ply.dy = 0;
        ply.y = 5 * gameSettings.blockSize;
    }

    if (dx != lastMove) {
        socket.emit(PACKET.CS_PLAYER_MOVE, (dx + 1).toString());
        lastMove = dx;
    }

    if (getKeyDown("space")) {
        socket.emit(PACKET.CS_PLAYER_JUMP);
        ply.dy = -gameSettings.jumpVelocity;
    }
}
