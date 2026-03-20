import { Axis, getAxis } from "../../lib/engine/engine";
import { PACKET } from "../net/packets";
import { socket } from "./game";
import { ply } from "./player";

let lastMove = 0;
export function handleInput() {
    // get axis
    let x = getAxis(Axis.Horizontal);
    if (lastMove != x) {
        ply.vx = x;
        lastMove = x;
        socket.emit(PACKET.CS_PLAYER_MOVE, (x + 1).toString());
    }
}
