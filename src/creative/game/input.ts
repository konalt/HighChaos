import { Axis, getAxis, getKeyDown } from "../../lib/engine/engine";
import { PACKET } from "../net/packets";
import { socket } from "./game";
import { ply } from "./player";
import { gameSettings } from "./settings";

let lastMove = 0;
export function handleInput(nullify = false) {
    // get axis
    let x = nullify ? 0 : getAxis(Axis.Horizontal);
    if (lastMove != x) {
        ply.vx = x;
        lastMove = x;
        socket.emit(PACKET.CS_PLAYER_MOVE, (x + 1).toString());
    }

    if (!nullify && getKeyDown("space")) {
        ply.vy = -gameSettings.jumpVelocity;
        socket.emit(PACKET.CS_PLAYER_JUMP);
    }
}
