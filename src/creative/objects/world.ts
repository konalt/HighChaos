import { ctx, d, getKeyDown, getMouse, h, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { distance, TwoNums } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { blocks, BlockStruct, BlockType } from "../game/blocks";
import { socket } from "../game/game";
import { ply } from "../game/player";
import { gameSettings } from "../game/settings";
import { PACKET } from "../net/packets";
import { SPRITES } from "../sprites";

const drawMargin = 0.5;
const REACH = 7 * 64;

export function drawBlock(blk: BlockStruct) {
    let x = blk.gx * gameSettings.blockSize - drawMargin;
    let y = -blk.gy * gameSettings.blockSize - drawMargin;

    let d = Math.abs(x - ply.x);
    if (d > w * 0.8) return;
    let base: HTMLImageElement = NULLTEXTURE;
    let overlay: HTMLImageElement;
    switch (blk.type) {
        case BlockType.DIRT:
            base = SPRITES.get("dirt");
            break;
        case BlockType.GRASS:
            base = SPRITES.get("dirt");
            overlay = SPRITES.get("grass_overlay");
            break;
        case BlockType.STONE:
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
    private hasReach: boolean;

    constructor() {
        super();
    }

    update() {
        if (!ply) return;

        let m = getMouse();
        this.mouse = [m[0] + this.scene.camera.x - w / 2, m[1] + this.scene.camera.y - h / 2];
        this.gridPos = getGridPos(this.mouse);
        this.worldPos = getWorldPos(this.gridPos);
        this.hasReach = distance(...this.worldPos, ply.x, ply.y) < REACH;

        if (getKeyDown("mouse1") && this.hasReach) {
            socket.emit(PACKET.CS_BLOCK_REMOVE, this.gridPos.join(","));
        }
    }

    draw() {
        if (!ply) return;

        for (const blk of blocks) {
            drawBlock(blk);
        }

        if (this.hasReach) {
            d.rect(
                ...this.worldPos,
                gameSettings.blockSize,
                gameSettings.blockSize,
                "transparent",
                "rgba(0,0,0,0.5)",
                2,
            );
        }
    }
}
