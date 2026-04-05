import { BlockStruct } from "../game/blocks";
import { GameSettings } from "../game/settings";
import { ClientPlayerState, ServerPlayerState } from "./interp";

export interface AckPacket {
    players: ServerPlayerState[];
    settings: GameSettings;
    blocks: BlockStruct[];
    pingTable: Record<string, number>;
    messages: [string, string][];
    names: [string, string][];
}

let cpua = 0;
let npua = () => {
    return 0xe100 + ++cpua;
};

export enum PACKET {
    SC_ACK = npua(),
    SC_DELTA_TIME = npua(),
    CS_PLAYER_MOVE = npua(),
    SC_PLAYER_UPDATE = npua(),
    SC_PLAYER_MOVE = npua(),
    CS_PLAYER_JOIN = npua(),
    SC_PLAYER_JOIN = npua(),
    SC_PLAYER_LEAVE = npua(),
    CS_PLAYER_USERNAME = npua(),
    SC_PLAYER_USERNAME = npua(),
    CS_PLAYER_JUMP = npua(),
    SC_PLAYER_JUMP = npua(),
    SC_PING_SEND = npua(),
    CS_PING_RESP = npua(),
    SC_PING_TABLE = npua(),
    CS_CHAT_SEND = npua(),
    SC_CHAT_RECV = npua(),
    SC_CHAT_CLEAR = npua(),
    CS_BLOCK_UPDATE = npua(),
    CS_BLOCK_REMOVE = npua(),
    SC_BLOCK_UPDATE = npua(),
    SC_BLOCK_REMOVE = npua(),
}
