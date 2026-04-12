import { canvas, ctx, getCanvas, loadImageAbsolute, useCanvas } from "../../lib/engine/engine";
import { sample } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { drawBlockRaw } from "../objects/world";
import { Chunk, CHUNK_SIZE } from "./chunk";
import { gameSettings } from "./settings";
import { world } from "./world";

export let rendererCache: Map<string, HTMLImageElement> = new Map();

export let CHUNK_RENDER_SIZE = 64;

export function initChunkRenderer() {
    CHUNK_RENDER_SIZE = CHUNK_SIZE * gameSettings.blockSize;
}

export async function cacheChunk(chunk: Chunk) {
    if (chunk.data.length == 0) return;
    if (!rendererCache.get(`${chunk.x},${chunk.y}`)) rendererCache.set(`${chunk.x},${chunk.y}`, NULLTEXTURE);

    useCanvas(1);
    canvas.width = canvas.height = CHUNK_RENDER_SIZE;

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
        );
    }
    useCanvas(0);

    let image = await loadImageAbsolute(getCanvas(1).toDataURL("image/png"));
    rendererCache.set(`${chunk.x},${chunk.y}`, image);

    return image;
}

export function drawChunk(cx: number, cy: number) {
    if (world.getChunk(cx, cy).data.length == 0) return;
    let img = rendererCache.get(`${cx},${cy}`);
    if (!img) {
        cacheChunk(world.getChunk(cx, cy));
        return;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        img ?? NULLTEXTURE,
        cx * CHUNK_RENDER_SIZE - 0.5,
        cy * CHUNK_RENDER_SIZE - 0.5,
        CHUNK_RENDER_SIZE + 1,
        CHUNK_RENDER_SIZE + 1,
    );
}
