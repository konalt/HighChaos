import { Player } from "../game";

export interface AckPacket {
    players: [string, Player][];
}
