import { Player } from "../game";

export interface AckPacket {
    players: [string, Player][];
}

let cpua = 0;
let npua = () => {
    return 0xe100 + ++cpua;
};

export enum PACKET {
    ACK = npua(),
    CS_PLAYER_MOVE = npua(),
    SC_PLAYER_UPDATE = npua(),
}
