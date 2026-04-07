import { ctx, getKeyDown, getMouse, w, h, debugMode, d, font } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { TwoNums, FourNums, basicPointInRect, distance } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { BlockType, BlockStruct, getClosestBlockAt, getBlockAt, blocks, culledBlocks } from "../game/blocks";
import { setLayer, layer, socket, hotbar, hotbarSlot, pickBlock, currentBlock } from "../game/game";
import { ply } from "../game/player";
import { gameSettings } from "../game/settings";
import { PACKET } from "../net/packets";
import { getBlockSprite } from "../sprites";

export function drawBlockRaw(
    x: number,
    y: number,
    w: number,
    h: number,
    type: BlockType,
    subtype: number,
    dark = false,
) {
    if (Number(type) == -1) return;
    let base: HTMLImageElement | undefined = NULLTEXTURE;
    let overlay: HTMLImageElement | undefined;
    switch (type) {
        case BlockType.GRASS:
            base = getBlockSprite("dirt", dark);
            overlay = getBlockSprite("grass_overlay", dark);
            break;
        case BlockType.WOOL:
            base = getBlockSprite(`wool__${subtype}`, dark);
            break;
        default:
            base = getBlockSprite((BlockType[type] ?? "unknown").toLowerCase(), dark);
            if (!BlockType[type]) console.log(type);
            break;
    }

    let _s = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(base ?? NULLTEXTURE, x, y, w, h);
    if (overlay) {
        ctx.drawImage(overlay, x, y, w + WORLD_DRAW_MARGIN * 2, h);
    }
    ctx.imageSmoothingEnabled = _s;
}

export function drawBlock(blk: BlockStruct, cullLocation: TwoNums, cullDistance: number) {
    let x = blk.gx * gameSettings.blockSize - WORLD_DRAW_MARGIN;
    let y = -blk.gy * gameSettings.blockSize - WORLD_DRAW_MARGIN;

    let d = Math.max(Math.abs(x - cullLocation[0]), Math.abs(y - cullLocation[1]));
    if (d > cullDistance) return;

    drawBlockRaw(
        x,
        y,
        gameSettings.blockSize + WORLD_DRAW_MARGIN * 2,
        gameSettings.blockSize + WORLD_DRAW_MARGIN * 2,
        blk.type,
        blk.subtype,
        blk.layer == 0,
    );
}

export function getGridPos(pos: TwoNums): TwoNums {
    return [Math.floor(pos[0] / gameSettings.blockSize), -Math.floor(pos[1] / gameSettings.blockSize)] as TwoNums;
}

export function getWorldPos(pos: TwoNums): TwoNums {
    return [pos[0] * gameSettings.blockSize, -pos[1] * gameSettings.blockSize] as TwoNums;
}

const WORLD_DRAW_MARGIN = 0.5;
const REACH = 7 * 64;

export class World extends GameObject {
    private mouse: TwoNums;
    private gridPos: TwoNums;
    private worldPos: TwoNums;
    private hasReach: boolean;
    private canPlace: boolean;

    disableControl = false;
    noclickAreas: Map<string, FourNums> = new Map();

    constructor() {
        super();

        this.mouse = [0, 0];
        this.gridPos = [0, 0];
        this.worldPos = [0, 0];
        this.hasReach = false;
        this.canPlace = false;
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

        if (getKeyDown("keyq")) {
            setLayer(layer == 0 ? 1 : 0);
        }

        let m = getMouse();
        this.mouse = [m[0] + this.scene.camera.x - w / 2, m[1] + this.scene.camera.y - h / 2];
        this.gridPos = getGridPos(this.mouse);
        this.worldPos = getWorldPos(this.gridPos);
        this.hasReach = distance(...this.mouse, ply.x, ply.y) < REACH;
        if (this.hasReach) this.hasReach = this._checkNoclickAreas(getMouse(true));

        if (this.hasReach) {
            let closestBlock = getClosestBlockAt(...this.gridPos);
            if (getKeyDown("mouse2")) {
                if (currentBlock[0] > -1) {
                    if (!closestBlock || closestBlock?.layer < layer) {
                        let block = getBlockAt(...this.gridPos, layer);
                        if (!block || getKeyDown("mouse1"))
                            socket.emit(PACKET.CS_BLOCK_UPDATE, [...this.gridPos, ...currentBlock, layer].join(","));
                    }
                }
            } else if (getKeyDown("mouse1")) {
                if (closestBlock) {
                    socket.emit(PACKET.CS_BLOCK_REMOVE, [...this.gridPos, closestBlock.layer].join(","));
                }
            } else if (getKeyDown("mouse3")) {
                if (closestBlock) {
                    pickBlock(closestBlock.type, closestBlock.subtype);
                    setLayer(closestBlock.layer as 0 | 1);
                }
            }
            this.canPlace = !closestBlock;
        } else {
            this.canPlace = false;
        }

        if (getKeyDown("f4")) {
            let block = getClosestBlockAt(...this.gridPos);
            console.log(block);
        }
    }

    draw() {
        if (!ply) return;

        for (const blk of culledBlocks) {
            drawBlock(
                blk,
                [this.scene.camera.x, this.scene.camera.y],
                (w / this.scene.camera.zoom) * 0.5 + gameSettings.blockSize,
            );
        }

        if (this.hasReach && !this.disableControl) {
            if (this.canPlace) {
                ctx.globalAlpha = 0.3;
                drawBlockRaw(
                    ...this.worldPos,
                    gameSettings.blockSize,
                    gameSettings.blockSize,
                    ...currentBlock,
                    layer == 0,
                );
                ctx.globalAlpha = 1;
            } else {
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
}
