import { TwoNums } from "../../lib/engine/utils";
import {
    ackHandler,
    blockRemoveHandler,
    blockUpdateHandler,
    chatClearHandler,
    chatHandler,
    deltaTimeHandler,
    pingSendHandler,
    pingTableHandler,
    playerJoinHandler,
    playerJumpHandler,
    playerLeaveHandler,
} from "../handlers";
import { handleUpdatePacket } from "../net/interp";
import { GameSocket } from "../net/network";
import { PACKET } from "../net/packets";
import { BlockType } from "./blocks";
import { handleNameUpdate } from "./extraplayerinfo";

export let socket: GameSocket;

export let textDecoder = new TextDecoder();
export let textEncoder = new TextEncoder();

export function connect(): Promise<void> {
    return new Promise<void>((res, rej) => {
        socket = new GameSocket();
        socket.on(PACKET.SC_ACK, (packetStr) => {
            if (!packetStr) return;

            ackHandler(packetStr);

            res();
        });

        socket.on(PACKET.SC_DELTA_TIME, deltaTimeHandler);

        socket.on(PACKET.SC_PLAYER_JOIN, playerJoinHandler);
        socket.on(PACKET.SC_PLAYER_UPDATE, handleUpdatePacket); // new player system
        //socket.on(PACKET.SC_PLAYER_MOVE, playerMoveHandler);
        socket.on(PACKET.SC_PLAYER_JUMP, playerJumpHandler);
        socket.on(PACKET.SC_PLAYER_LEAVE, playerLeaveHandler);
        socket.on(PACKET.SC_PLAYER_USERNAME, handleNameUpdate);

        socket.on(PACKET.SC_PING_SEND, pingSendHandler);
        socket.on(PACKET.SC_PING_TABLE, pingTableHandler);

        socket.on(PACKET.SC_CHAT_RECV, chatHandler);
        socket.on(PACKET.SC_CHAT_CLEAR, chatClearHandler);

        socket.on(PACKET.SC_BLOCK_UPDATE, blockUpdateHandler);
        socket.on(PACKET.SC_BLOCK_REMOVE, blockRemoveHandler);
    });
}

export let serverDeltaTime = 0;

export function setSDT(n: number) {
    serverDeltaTime = n;
}

export let layer = 1;
export let hotbar: TwoNums[] = new Array(9).fill([-1, -1]);
hotbar[0] = [BlockType.DIRT, 0];
hotbar[1] = [BlockType.STONE, 0];
hotbar[2] = [BlockType.WOOD, 0];
hotbar[3] = [BlockType.PLANKS, 0];
hotbar[4] = [BlockType.GLASS, 0];
export let hotbarSlot = 0;
export let currentBlock: TwoNums = hotbar[hotbarSlot];

export function setLayer(l: 0 | 1) {
    layer = l;
}

export function selectHotbarSlot(newSlot: number) {
    if (newSlot < 0) {
        hotbarSlot = hotbar.length - 1;
    } else if (newSlot > hotbar.length - 1) {
        hotbarSlot = 0;
    } else {
        hotbarSlot = newSlot;
    }
    currentBlock = hotbar[hotbarSlot];
}

export function pickBlock(block: BlockType, subtype: number) {
    let index = hotbar.findIndex((v) => v[0] == block && v[1] == subtype);
    if (index == -1) {
        let emptyIndex = hotbar.findIndex((v) => v[0] == -1);
        if (emptyIndex != -1) {
            hotbarSlot = emptyIndex;
        }
        hotbar[hotbarSlot] = [block, subtype];
    } else {
        hotbarSlot = index;
    }
    currentBlock = hotbar[hotbarSlot];
}

export const UI_COLOR = "rgba(0,0,0,0.75)";
