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
} from "../handlers";
import { handleUpdatePacket } from "../net/interp";
import { GameSocket } from "../net/network";
import { PACKET } from "../net/packets";

export let socket: GameSocket;

export let textDecoder = new TextDecoder();
export let textEncoder = new TextEncoder();

export function connect(): Promise<void> {
    return new Promise<void>((res, rej) => {
        socket = new GameSocket();
        socket.on(PACKET.SC_ACK, (packetStr) => {
            ackHandler(packetStr);

            res();
        });

        socket.on(PACKET.SC_DELTA_TIME, deltaTimeHandler);

        socket.on(PACKET.SC_PLAYER_JOIN, playerJoinHandler);
        socket.on(PACKET.SC_PLAYER_UPDATE, handleUpdatePacket); // new player system
        //socket.on(PACKET.SC_PLAYER_MOVE, playerMoveHandler);
        /* socket.on(PACKET.SC_PLAYER_JUMP, playerJumpHandler);
        socket.on(PACKET.SC_PLAYER_LEAVE, playerLeaveHandler); */

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
