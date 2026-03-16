import { GameSettings, Player } from "../game";

export interface AckPacket {
    players: [string, Player][];
    settings: GameSettings;
}

let cpua = 0;
let npua = () => {
    return 0xe100 + ++cpua;
};

export enum PACKET {
    SC_ACK = npua(),
    CS_PLAYER_MOVE = npua(),
    SC_PLAYER_UPDATE = npua(),
    CS_PLAYER_JOIN = npua(),
    SC_PLAYER_JOIN = npua(),
    SC_PLAYER_LEAVE = npua(),
    CS_PLAYER_USERNAME = npua(),
    SC_PLAYER_USERNAME = npua(),
}
