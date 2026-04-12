import { Chunk } from "./chunk";

export function generateChunk(x: number, y: number) {
    return new Chunk(x, y);
}
