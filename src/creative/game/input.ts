import { Axis, getAxis, getKeyDown } from "../../lib/engine/engine";
import { playerLadderCheck } from "../collision";
import { PACKET } from "../net/packets";
import { socket } from "./game";
import { ply } from "./player";
import { gameSettings } from "./settings";

let lastMove = 0;
let lastLadder = 0;

export function handleInput(nullify = false) {
    // get axis
    let x = nullify ? 0 : getAxis(Axis.Horizontal);
    if (lastMove != x) {
        ply.vx = x;
        lastMove = x;
        socket.emit(PACKET.CS_PLAYER_MOVE, (x + 1).toString());
    }

    let y = nullify ? 0 : getAxis(Axis.Vertical);
    let lcheck = playerLadderCheck(ply);
    if (lastLadder != y && lcheck) {
        lastLadder = y;
        ply.ld = true;
        ply.vy = y;
        socket.emit(PACKET.CS_PLAYER_LADDER, (y + 1).toString());
    } else if (!lcheck) {
        lastLadder = 0;
    }

    if (!nullify && getKeyDown("space") && !ply.ld) {
        ply.vy = -gameSettings.jumpVelocity;
        socket.emit(PACKET.CS_PLAYER_JUMP);
    }
}
