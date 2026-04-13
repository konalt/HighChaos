import { ctx, getKeyDown, getMouse, w, h, d, debugMode } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { TwoNums, FourNums, basicPointInRect, distance } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { Block, getBlockData } from "../game/blocks";
import { worldCoordsToChunkCoords } from "../game/chunk";
import { CHUNK_RENDER_SIZE, drawChunk } from "../game/chunkrenderer";
import { setLayer, layer, socket, pickBlock, currentBlock } from "../game/game";
import { ply } from "../game/player";
import { gameSettings } from "../game/settings";
import { world } from "../game/world";
import { PACKET } from "../net/packets";
import { getBlockSprite } from "../sprites";

export function drawBlockRaw(
    x: number,
    y: number,
    w: number,
    h: number,
    type: Block,
    subtype: number,
    dark = false,
    _ctx = ctx,
) {
    if (Number(type) == -1) return;
    let base: HTMLImageElement | undefined = NULLTEXTURE;
    let overlay: HTMLImageElement | undefined;
    switch (type) {
        case Block.GRASS:
            base = getBlockSprite("dirt", dark);
            overlay = getBlockSprite("grass_overlay", dark);
            break;
        case Block.WOOL:
            base = getBlockSprite(`wool__${subtype}`, dark);
            break;
        default:
            let prefix = "";
            let data = getBlockData(type);
            if (data.isFurniture) prefix = "furniture/";
            base = getBlockSprite(prefix + (Block[type] ?? "unknown").toLowerCase(), dark);
            if (!Block[type]) console.log(type);
            break;
    }

    _ctx.drawImage(base ?? NULLTEXTURE, x, y, w, h);
    if (overlay) {
        _ctx.drawImage(overlay, x, y, w, h);
    }
}

export function getGridPos(pos: TwoNums): TwoNums {
    return [Math.floor(pos[0] / gameSettings.blockSize), Math.floor(pos[1] / gameSettings.blockSize)] as TwoNums;
}

export function getWorldPos(pos: TwoNums): TwoNums {
    return [pos[0] * gameSettings.blockSize, pos[1] * gameSettings.blockSize] as TwoNums;
}

const REACH = 7 * 64;

export class World extends GameObject {
    private mouse: TwoNums;
    private gridPos: TwoNums;
    private worldPos: TwoNums;
    private hasReach: boolean;
    private canPlace: boolean;

    private _minChunkX = 0;
    private _minChunkY = 0;
    private _maxChunkX = 0;
    private _maxChunkY = 0;

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
            let closestBlock = world.getClosestBlockAt(...this.gridPos);
            if (getKeyDown("mouse2")) {
                if (currentBlock[0] > -1) {
                    if (!closestBlock || closestBlock?.layer < layer) {
                        let block = world.getBlockAt(...this.gridPos, layer);
                        if (!block || getKeyDown("mouse1"))
                            socket.emit(PACKET.CS_BLOCK_UPDATE, [...this.gridPos, layer, ...currentBlock].join(","));
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
            let block = world.getClosestBlockAt(...this.gridPos);
            console.log(this.gridPos, block);
        }

        let min = worldCoordsToChunkCoords(
            this.scene.camera.x - (w / this.scene.camera.zoom) * 0.5 - CHUNK_RENDER_SIZE / 2,
            this.scene.camera.y - (h / this.scene.camera.zoom) * 0.5 - CHUNK_RENDER_SIZE / 2,
        )[0];
        let max = worldCoordsToChunkCoords(
            this.scene.camera.x + (w / this.scene.camera.zoom) * 0.5 + CHUNK_RENDER_SIZE / 2,
            this.scene.camera.y + (h / this.scene.camera.zoom) * 0.5 + CHUNK_RENDER_SIZE / 2,
        )[0];
        this._minChunkX = min[0];
        this._minChunkY = min[1];
        this._maxChunkX = max[0];
        this._maxChunkY = max[1];
    }

    draw() {
        if (!ply) return;

        /* for (const blk of culledBlocks) {
            drawBlock(
                blk,
                [this.scene.camera.x, this.scene.camera.y],
                (w / this.scene.camera.zoom) * 0.5 + gameSettings.blockSize,
            );
        } */

        for (let cy = this._minChunkY; cy <= this._maxChunkY; cy++) {
            for (let cx = this._minChunkX; cx <= this._maxChunkX; cx++) {
                drawChunk(cx, cy);
            }
        }

        if (debugMode) {
            ctx.strokeStyle = "#0000ff";
            ctx.lineWidth = 1;
            for (let cy = this._minChunkY; cy <= this._maxChunkY; cy++) {
                ctx.beginPath();
                ctx.moveTo(this._minChunkX * CHUNK_RENDER_SIZE, cy * CHUNK_RENDER_SIZE);
                ctx.lineTo(this._maxChunkX * CHUNK_RENDER_SIZE, cy * CHUNK_RENDER_SIZE);
                ctx.stroke();
            }
            for (let cx = this._minChunkX; cx <= this._maxChunkX; cx++) {
                ctx.beginPath();
                ctx.moveTo(cx * CHUNK_RENDER_SIZE, this._minChunkY * CHUNK_RENDER_SIZE);
                ctx.lineTo(cx * CHUNK_RENDER_SIZE, this._maxChunkY * CHUNK_RENDER_SIZE);
                ctx.stroke();
            }
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
