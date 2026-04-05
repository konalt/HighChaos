import { ctx, d, getKeyDown, getMouse, h, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { basicPointInRect, distance, FourNums, rectIntersect, TwoNums } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { blocks, BlockStruct, BlockType, getBlockAt } from "../game/blocks";
import { hotbar, hotbarSlot, pickBlock, socket } from "../game/game";
import { ply } from "../game/player";
import { gameSettings } from "../game/settings";
import { PACKET } from "../net/packets";
import { SPRITES } from "../sprites";

const drawMargin = 0.5;
const REACH = 7 * 64;

export function drawBlockRaw(x: number, y: number, w: number, h: number, type: BlockType) {
    let base: HTMLImageElement | undefined = NULLTEXTURE;
    let overlay: HTMLImageElement | undefined;
    switch (type) {
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
        case BlockType.WOOD:
            base = SPRITES.get("wood");
            break;
        case BlockType.LEAVES:
            base = SPRITES.get("leaves");
            break;
    }

    let _s = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(base ?? NULLTEXTURE, x, y, w, h);
    if (overlay) {
        ctx.drawImage(overlay, x, y, w + drawMargin * 2, h);
    }
    ctx.imageSmoothingEnabled = _s;
}

export function drawBlock(blk: BlockStruct, cullLocation: TwoNums, cullDistance: number) {
    let x = blk.gx * gameSettings.blockSize - drawMargin;
    let y = -blk.gy * gameSettings.blockSize - drawMargin;

    let d = Math.max(Math.abs(x - cullLocation[0]), Math.abs(y - cullLocation[1]));
    if (d > cullDistance) return;

    drawBlockRaw(x, y, gameSettings.blockSize + drawMargin * 2, gameSettings.blockSize + drawMargin * 2, blk.type);
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

    disableControl = false;
    noclickAreas: Map<string, FourNums> = new Map();

    constructor() {
        super();

        this.mouse = [0, 0];
        this.gridPos = [0, 0];
        this.worldPos = [0, 0];
        this.hasReach = false;
    }

    private _checkNoclickAreas(mouse: TwoNums) {
        for (const [_, rect] of this.noclickAreas) {
            if (basicPointInRect(...mouse, ...rect)) {
                return false;
            }
        }
        return true;
    }

    update() {
        if (!ply || this.disableControl) return;

        let m = getMouse();
        this.mouse = [m[0] + this.scene.camera.x - w / 2, m[1] + this.scene.camera.y - h / 2];
        this.gridPos = getGridPos(this.mouse);
        this.worldPos = getWorldPos(this.gridPos);
        this.hasReach = distance(...this.mouse, ply.x, ply.y) < REACH;
        if (this.hasReach) this.hasReach = this._checkNoclickAreas(getMouse(true));

        if (this.hasReach) {
            if (getKeyDown("mouse2")) {
                let block = getBlockAt(...this.gridPos);
                if (!block || getKeyDown("mouse1"))
                    socket.emit(PACKET.CS_BLOCK_UPDATE, [...this.gridPos, hotbar[hotbarSlot]].join(","));
            } else if (getKeyDown("mouse1")) {
                socket.emit(PACKET.CS_BLOCK_REMOVE, this.gridPos.join(","));
            } else if (getKeyDown("mouse3")) {
                let block = getBlockAt(...this.gridPos);
                if (block) {
                    pickBlock(block.type);
                }
            }
        }

        if (getKeyDown("f4")) {
            let block = getBlockAt(...this.gridPos);
            console.log(block);
        }
    }

    draw() {
        if (!ply) return;

        for (const blk of blocks) {
            drawBlock(
                blk,
                [this.scene.camera.x, this.scene.camera.y],
                (w / this.scene.camera.zoom) * 0.5 + gameSettings.blockSize,
            );
        }

        if (this.hasReach && !this.disableControl) {
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
