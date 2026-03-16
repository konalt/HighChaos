import { FourNums, distance, rectIntersect } from "../lib/engine/utils";
import { blocks, BlockStruct, gameSettings } from "./game";

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
