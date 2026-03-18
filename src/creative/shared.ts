import { deltaTime } from "../lib/engine/engine";
import { FourNums } from "../lib/engine/utils";
import { checkBlockIntersection } from "./collision";
import { Player, gameSettings } from "./game";

export function updatePlayer(ply: Player) {
    const _ply = { ...ply };

    //console.log(ply.id, ply.dx, ply.x);

    ply.old_x = parseFloat(ply.x.toString());
    ply.x += ply.dx * gameSettings.playerSpeed * deltaTime;

    let plyRect: FourNums = [
        ply.x - gameSettings.playerWidth / 2,
        ply.y - gameSettings.playerHeight,
        gameSettings.playerWidth,
        gameSettings.playerHeight,
    ];
    let check = checkBlockIntersection(plyRect);
    if (check) {
        ply.x = _ply.x;
    }

    ply.old_y = parseFloat(ply.y.toString());
    ply.dy += gameSettings.gravity * deltaTime;
    if (ply.dy > gameSettings.playerTerminalVelocity) ply.dy = gameSettings.playerTerminalVelocity;
    ply.y += ply.dy * deltaTime;

    plyRect = [
        ply.x - gameSettings.playerWidth / 2,
        ply.y - gameSettings.playerHeight,
        gameSettings.playerWidth,
        gameSettings.playerHeight,
    ];
    check = checkBlockIntersection(plyRect);
    if (check) {
        ply.dy = 0;
        ply.y = _ply.y;
    }

    if (ply.y > 5 * gameSettings.blockSize) {
        ply.dy = 0;
        ply.y = 5 * gameSettings.blockSize;
    }
}
