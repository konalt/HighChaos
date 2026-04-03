import { FourNums, TwoNums, distance, rectIntersect } from "../lib/engine/utils";
import { blocks, BlockStruct } from "./game/blocks";
import { gameSettings } from "./game/settings";
import { ClientPlayerState } from "./net/interp";

export function checkBlockIntersection(r: FourNums): BlockStruct | null {
    let filt = blocks.filter(
        (b) => distance(b.gx * gameSettings.blockSize, -b.gy * gameSettings.blockSize, r[0], r[1]) <= 500,
    );
    for (const blk of filt) {
        const r2: FourNums = [
            blk.gx * gameSettings.blockSize,
            -blk.gy * gameSettings.blockSize,
            gameSettings.blockSize,
            gameSettings.blockSize,
        ];
        if (rectIntersect(...r, ...r2)) return blk;
    }
    return null;
}

export function playerCollisionCheck(ply: ClientPlayerState, dir: "x" | "y", prev: TwoNums) {
    let block = checkBlockIntersection([
        ply.x - gameSettings.playerWidth / 2,
        ply.y - gameSettings.playerHeight,
        gameSettings.playerWidth,
        gameSettings.playerHeight,
    ]);
    if (!block) return false;
    if (dir == "x") {
        ply.x = prev[0];
    } else {
        ply.y = prev[1];
        ply.vy = 0;
    }
    return true;
}
