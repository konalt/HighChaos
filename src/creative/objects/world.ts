import { ctx, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { Block, blocks, BlockStruct, gameSettings, ply } from "../game";
import { SPRITES } from "../sprites";

const drawMargin = 1;

export function drawBlock(blk: BlockStruct) {
    let x = blk.gx * gameSettings.blockSize - drawMargin;
    let y = -blk.gy * gameSettings.blockSize - drawMargin;

    let d = Math.abs(x - ply.x);
    if (d > w * 0.8) return;
    let base: HTMLImageElement = NULLTEXTURE;
    let overlay: HTMLImageElement;
    switch (blk.type) {
        case Block.DIRT:
            base = SPRITES.get("dirt");
            break;
        case Block.GRASS:
            base = SPRITES.get("dirt");
            overlay = SPRITES.get("grass_overlay");
            break;
        case Block.STONE:
            base = SPRITES.get("stone");
            break;
    }

    let _s = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(base, x, y, gameSettings.blockSize + drawMargin * 2, gameSettings.blockSize + drawMargin * 2);
    if (overlay) {
        ctx.drawImage(overlay, x, y, gameSettings.blockSize + drawMargin * 2, gameSettings.blockSize + drawMargin * 2);
    }
    ctx.imageSmoothingEnabled = _s;
}

export class World extends GameObject {
    constructor() {
        super();
    }

    draw() {
        for (const blk of blocks) {
            drawBlock(blk);
        }
    }
}
