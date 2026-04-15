import { Axis, getAxis, getKey, getKeyDown } from "../../lib/engine/engine";
import { PACKET } from "../net/packets";
import { socket } from "./game";
import { ply } from "./player";
import { gameSettings } from "./settings";
import { world } from "./world";

let lastMove = 0;
let lastLadder = 0;

export function handleInput(nullify = false) {
    // get axis
    let x = nullify ? 0 : getAxis(Axis.Horizontal);
    if (lastMove != x) {
        ply.dx = x;
        lastMove = x;
        socket.emit(PACKET.CS_PLAYER_MOVE, (x + 1).toString());
    }

    let y = nullify ? 0 : getAxis(Axis.Vertical);
    let lcheck = world.playerLadderCheck(ply);
    if (lastLadder != y && lcheck) {
        lastLadder = y;
        ply.ladder = true;
        ply.dy = y;
        socket.emit(PACKET.CS_PLAYER_LADDER, (y + 1).toString());
    } else if (!lcheck) {
        lastLadder = 0;
    }

    if (!nullify && getKeyDown("space") && !ply.ladder) {
        if (y > 0) {
            ply.y += 2;
            if (ply.dy == 0) {
                let check = world.playerBlockCheck(ply, [ply.x, ply.y + 1]);
                if (check) {
                    ply.y -= 2;
                }
            }
            socket.emit(PACKET.CS_PLATFORM_DESCEND);
        } else {
            ply.dy = -gameSettings.jumpVelocity;
            socket.emit(PACKET.CS_PLAYER_JUMP);
        }
    }
}
