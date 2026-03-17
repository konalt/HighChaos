import { ctx, d, getMouse, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { TwoNums } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { Block, blocks, BlockStruct, gameSettings, ply } from "../game";
import { SPRITES } from "../sprites";

const drawMargin = 0.5;

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

export function getGridPos(pos: TwoNums): TwoNums {
    return [Math.floor(pos[0] / gameSettings.blockSize), -Math.floor(pos[1] / gameSettings.blockSize)] as TwoNums;
}

export function getWorldPos(pos: TwoNums): TwoNums {
    return [pos[0] * gameSettings.blockSize, -pos[1] * gameSettings.blockSize] as TwoNums;
}

export class World extends GameObject {
    private mouse: TwoNums;
    private gridPos: TwoNums;
    private worldPos: TwoNums;
    constructor() {
        super();
    }

    update() {
        this.mouse = getMouse();
        this.gridPos = getGridPos(this.mouse);
        this.worldPos = getWorldPos(this.gridPos);
    }

    draw() {
        for (const blk of blocks) {
            drawBlock(blk);
        }

        d.rect(...this.worldPos, gameSettings.blockSize, gameSettings.blockSize, "transparent", "rgba(0,0,0,0.5)", 2);
    }
}
