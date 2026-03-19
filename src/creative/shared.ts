import { serverDeltaTime } from "./game";
import { deltaTime as realDeltaTime } from "../lib/engine/engine";
import { FourNums } from "../lib/engine/utils";
import { checkBlockIntersection } from "./collision";
import { Player, gameSettings } from "./game";

export function updatePlayer(ply: Player) {
    let deltaTime = realDeltaTime;
    for (let i = 0; i < gameSettings.physSteps; i++) {
        let ox = parseFloat(ply.x.toString());
        let cx = parseFloat(ply.x.toString());
        cx += (ply.dx * gameSettings.playerSpeed * deltaTime) / gameSettings.physSteps;
        let serverDiff = ply.sv_x - cx;
        cx += (serverDiff * 0.05) / gameSettings.physSteps;

        let plyRect: FourNums = [
            cx - gameSettings.playerWidth / 2,
            ply.y - gameSettings.playerHeight,
            gameSettings.playerWidth,
            gameSettings.playerHeight,
        ];
        let check = checkBlockIntersection(plyRect);

        if (check) {
            break;
        } else {
            ply.old_x = ox;
            ply.x = cx;
        }
    }
    ply.x = Math.round(ply.x);

    for (let i = 0; i < gameSettings.physSteps; i++) {
        let oy = parseFloat(ply.y.toString());
        let cy = parseFloat(ply.y.toString());
        let cdy = parseFloat(ply.dy.toString());
        cdy += (gameSettings.gravity * deltaTime) / gameSettings.physSteps;
        if (cdy > gameSettings.playerTerminalVelocity) {
            cdy = gameSettings.playerTerminalVelocity;
        }
        cy += (cdy * deltaTime) / gameSettings.physSteps;
        let serverDiff = ply.sv_y - cy;
        cy += (serverDiff * 0.05) / gameSettings.physSteps;

        if (cy > 5 * gameSettings.blockSize) {
            ply.dy = 0;
            ply.y = 5 * gameSettings.blockSize;
            break;
        }

        let plyRect: FourNums = [
            ply.x - gameSettings.playerWidth / 2,
            cy - gameSettings.playerHeight,
            gameSettings.playerWidth,
            gameSettings.playerHeight,
        ];
        let check = checkBlockIntersection(plyRect);

        if (check) {
            ply.dy = 0;
            continue;
        }

        ply.old_y = oy;
        ply.y = cy;
        ply.dy = cdy;
    }
    ply.y = Math.round(ply.y);
}
