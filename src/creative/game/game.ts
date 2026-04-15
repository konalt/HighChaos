import { TwoNums } from "../../lib/engine/utils";
import {
    ackHandler,
    chatClearHandler,
    chatHandler,
    pingSendHandler,
    pingTableHandler,
    playerDescendHandler,
    playerJoinHandler,
    playerJumpHandler,
    playerLadderHandler,
    playerLeaveHandler,
} from "../handlers";
import { handleUpdatePacket } from "../net/interp";
import { GameSocket } from "../net/network";
import { PACKET } from "../net/packets";
import { Block, blockRemoveHandler, blockUpdateHandler } from "./blocks";
import { serverChunkHandler } from "./chunk";
import { handleNameUpdate } from "./extraplayerinfo";
import { b } from "./inventory";

export let socket: GameSocket;

export let textDecoder = new TextDecoder();
export let textEncoder = new TextEncoder();

export function connect(): Promise<void> {
    return new Promise<void>((res, rej) => {
        socket = new GameSocket();
        socket.on(PACKET.SC_ACK, async (packetStr) => {
            if (!packetStr) return;

            await ackHandler(packetStr);

            res();
        });

        socket.on(PACKET.SC_PLAYER_JOIN, playerJoinHandler);
        socket.on(PACKET.SC_PLAYER_UPDATE, handleUpdatePacket); // new player system
        //socket.on(PACKET.SC_PLAYER_MOVE, playerMoveHandler);
        socket.on(PACKET.SC_PLAYER_LADDER, playerLadderHandler);
        socket.on(PACKET.SC_PLAYER_JUMP, playerJumpHandler);
        socket.on(PACKET.SC_PLAYER_LEAVE, playerLeaveHandler);
        socket.on(PACKET.SC_PLAYER_USERNAME, handleNameUpdate);

        socket.on(PACKET.SC_PLATFORM_DESCEND, playerDescendHandler);

        socket.on(PACKET.SC_PING_SEND, pingSendHandler);
        socket.on(PACKET.SC_PING_TABLE, pingTableHandler);

        socket.on(PACKET.SC_CHAT_RECV, chatHandler);
        socket.on(PACKET.SC_CHAT_CLEAR, chatClearHandler);

        socket.on(PACKET.SC_BLOCK_UPDATE, blockUpdateHandler);
        socket.on(PACKET.SC_BLOCK_REMOVE, blockRemoveHandler);

        socket.on(PACKET.SC_CHUNK, serverChunkHandler);
    });
}

export let serverDeltaTime = 0;

export function setSDT(n: number) {
    serverDeltaTime = n;
}

export const HOTBAR_SELECT_KEYS: [number, string][] = new Array(9).fill(0).map((_, i) => [i, `Digit${i + 1}`]);
export const HOTBAR_SLOTS = 9;
export const EMPTY_INV_SLOT: TwoNums = [-1, -1];
export let layer = 1;
export let hotbar: TwoNums[] = new Array(HOTBAR_SLOTS).fill([...EMPTY_INV_SLOT]);
export let hotbarSlot = 0;
export let currentBlock: TwoNums = hotbar[hotbarSlot];

export function saveHotbar() {
    localStorage.setItem("creative_hotbar", JSON.stringify(hotbar));
    localStorage.setItem("creative_hotbar_slot", hotbarSlot.toString());
}

export function loadHotbar() {
    let saved = localStorage.getItem("creative_hotbar");
    if (saved) {
        hotbar = JSON.parse(saved);
    } else {
        hotbar[0] = b(Block.COBBLESTONE);
        hotbar[1] = b(Block.WOOD);
        hotbar[2] = b(Block.PLANKS);
        hotbar[3] = b(Block.BRICKS);
        hotbar[4] = b(Block.GLASS);
    }

    let savedSlot = localStorage.getItem("creative_hotbar_slot");
    if (savedSlot) {
        selectHotbarSlot(parseInt(savedSlot));
    } else {
        selectHotbarSlot(0);
    }
}

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
    localStorage.setItem("creative_hotbar_slot", hotbarSlot.toString());
}

export function firstEmptyHotbarSlot() {
    return hotbar.findIndex((v) => v[0] == -1);
}

export function setHotbarSlot(slot: number, item: TwoNums) {
    hotbar[slot] = item;
    currentBlock = hotbar[slot];

    saveHotbar();
}

export function pickBlock(block: Block, subtype: number) {
    let index = hotbar.findIndex((v) => v[0] == block && v[1] == subtype);
    if (index == -1) {
        let emptyIndex = firstEmptyHotbarSlot();
        if (emptyIndex != -1) {
            hotbarSlot = emptyIndex;
        }
        setHotbarSlot(hotbarSlot, [block, subtype]);
    } else {
        selectHotbarSlot(index);
    }
}

export const UI_COLOR = "rgba(0,0,0,0.75)";
