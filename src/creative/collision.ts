import { FourNums, TwoNums, distance, rectIntersect } from "../lib/engine/utils";
import { blocks, BlockStruct, collideBlocks, getBlockData } from "./game/blocks";
import { gameSettings } from "./game/settings";
import { ClientPlayerState } from "./net/interp";
import { getWorldPos } from "./objects/world";

export function checkBlockIntersection(r: FourNums, ignorePlatforms: boolean): BlockStruct | null {
    let filt = collideBlocks.filter(
        (b) =>
            distance(b.gx * gameSettings.blockSize, -b.gy * gameSettings.blockSize, r[0], r[1]) <=
                gameSettings.playerHeight * 2 && (ignorePlatforms ? !getBlockData(b.type).isPlatform : true),
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
    let collided = false;
    let down = dir == "y" && ply.y > prev[1];
    if (dir == "y" && ply.y > 5 * gameSettings.blockSize) {
        collided = true;
    } else {
        let block = checkBlockIntersection(
            [
                ply.x - gameSettings.playerWidth / 2,
                ply.y - gameSettings.playerHeight,
                gameSettings.playerWidth,
                gameSettings.playerHeight,
            ],
            !down,
        );
        if (block) {
            if (getBlockData(block.type).isPlatform) {
                collided = prev[1] < -block.gy * gameSettings.blockSize;
            } else {
                collided = true;
            }
        } else {
            collided = false;
        }
    }
    if (!collided) return false;
    if (dir == "x") {
        ply.x = prev[0];
    } else {
        ply.y = prev[1];
        if (!ply.ld) ply.vy = 0;
    }
    return true;
}

export function playerLadderCheck(ply: ClientPlayerState) {
    const plyRect: FourNums = [
        ply.x - gameSettings.playerWidth / 2,
        ply.y - gameSettings.playerHeight,
        gameSettings.playerWidth,
        gameSettings.playerHeight,
    ];
    let currentLadder = blocks.find((b) => {
        let d = getBlockData(b.type);
        if (!d.isLadder) return;
        let wp = getWorldPos([b.gx, b.gy]);
        if (rectIntersect(...plyRect, ...wp, gameSettings.blockSize, gameSettings.blockSize)) {
            return true;
        }
        return false;
    });
    if (currentLadder) return true;
    return false;
}
