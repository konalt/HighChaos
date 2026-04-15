import { canvas, ctx, currentScene, getCanvas, h, loadImageAbsolute, useCanvas, w } from "../../lib/engine/engine";
import { intList, sample, TwoNums } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { drawBlockRaw } from "../objects/world";
import { Chunk, CHUNK_SIZE, worldCoordsToChunkCoords } from "./chunk";
import { currentBlock } from "./game";
import { gameSettings } from "./settings";
import { world } from "./world";

export let rendererCache: Map<string, OffscreenCanvas> = new Map();

export let CHUNK_RENDER_SIZE = 64;
export const MAX_CHUNK_CACHE_SIZE = 64;
export const MAX_CHUNK_DIST = 10;

export function initChunkRenderer() {
    CHUNK_RENDER_SIZE = CHUNK_SIZE * gameSettings.blockSize;
}

export async function cacheChunk(chunk: Chunk) {
    if (chunk.data.length == 0) return;

    const c = new OffscreenCanvas(CHUNK_RENDER_SIZE, CHUNK_RENDER_SIZE);
    if (!rendererCache.get(`${chunk.x},${chunk.y}`)) rendererCache.set(`${chunk.x},${chunk.y}`, c);
    const ctx = c.getContext("2d");

    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    for (const block of chunk.data) {
        drawBlockRaw(
            block.gx * gameSettings.blockSize,
            block.gy * gameSettings.blockSize,
            gameSettings.blockSize,
            gameSettings.blockSize,
            block.type,
            block.subtype,
            block.layer == 0,
            ctx as unknown as CanvasRenderingContext2D, // :3
        );
    }

    rendererCache.set(`${chunk.x},${chunk.y}`, c);

    return c;
}

export function isInRenderDistance(cx: number, cy: number) {
    let [chunkpos, subchunkpos] = worldCoordsToChunkCoords(currentScene.camera.x, currentScene.camera.y);
    chunkpos = chunkpos.map((n, i) => n + subchunkpos[i] / CHUNK_SIZE) as TwoNums;
    return (
        Math.abs(cx - chunkpos[0]) < Math.min(MAX_CHUNK_DIST, w / currentScene.camera.zoom / CHUNK_RENDER_SIZE + 1) &&
        Math.abs(cy - chunkpos[1]) < Math.min(MAX_CHUNK_DIST, h / currentScene.camera.zoom / CHUNK_RENDER_SIZE + 1)
    );
}

export function trimChunks() {
    for (const k of rendererCache.keys()) {
        const [x, y] = intList(k);
        if (!isInRenderDistance(x, y)) {
            rendererCache.delete(k);
        }
    }
    world.trimChunks();
}

export function drawChunk(cx: number, cy: number) {
    if (!isInRenderDistance(cx, cy)) return;
    if (world.getChunk(cx, cy).data.length == 0) return false;
    let img = rendererCache.get(`${cx},${cy}`);
    if (!img) {
        cacheChunk(world.getChunk(cx, cy));
        return false;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        img ?? NULLTEXTURE,
        cx * CHUNK_RENDER_SIZE - 0.5,
        cy * CHUNK_RENDER_SIZE - 0.5,
        CHUNK_RENDER_SIZE + 1,
        CHUNK_RENDER_SIZE + 1,
    );
    return true;
}
