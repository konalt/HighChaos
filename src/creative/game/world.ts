import { d } from "../../lib/engine/engine";
import { FourNums, rectIntersect, TwoNums } from "../../lib/engine/utils";
import { ClientPlayerState } from "../net/interp";
import { Block, BlockStruct, getBlockData } from "./blocks";
import { CHUNK_SIZE, Chunk, blockCoordsToChunkCoords, serverRequestChunk, worldCoordsToChunkCoords } from "./chunk";
import { cacheChunk } from "./chunkrenderer";
import { generateChunk } from "./generator";
import { gameSettings } from "./settings";

export class World {
    name = "World";
    chunks: Chunk[] = [];

    deserializeChunk(chunkData: string) {
        const chunk = Chunk.deserialize(chunkData);
        const chunk2 = this.chunks.find((ch) => ch.x == chunk.x && ch.y == chunk.y);
        if (chunk2) {
            chunk2.setData(chunk.data);
            cacheChunk(chunk2);
        } else {
            this.chunks.push(chunk);
            cacheChunk(chunk);
        }
    }

    getChunk(cx: number, cy: number) {
        const c = this.chunks.find((ch) => ch.x == cx && ch.y == cy);
        if (c) return c;
        serverRequestChunk(cx, cy);
        return generateChunk(cx, cy);
    }

    getBlockAt(bx: number, by: number, layer: number) {
        let chunkPos = blockCoordsToChunkCoords(bx, by);
        let chunk = this.getChunk(...chunkPos[0]);
        return chunk.getBlock(...chunkPos[1], layer);
    }

    getClosestBlockAt(bx: number, by: number) {
        let chunkPos = blockCoordsToChunkCoords(bx, by);
        let chunk = this.getChunk(...chunkPos[0]);
        return chunk.getClosestBlock(...chunkPos[1]);
    }

    removeBlock(bx: number, by: number, layer: number) {
        let chunkPos = blockCoordsToChunkCoords(bx, by);
        let chunk = this.getChunk(...chunkPos[0]);
        chunk.removeBlock(...chunkPos[1], layer);
    }

    setBlock(bx: number, by: number, layer: number, type: Block, subtype: number) {
        let chunkPos = blockCoordsToChunkCoords(bx, by);
        let chunk = this.getChunk(...chunkPos[0]);
        chunk.setBlock(...chunkPos[1], layer, type, subtype);
    }

    playerBlockCheck(ply: ClientPlayerState, lastPos: TwoNums): [BlockStruct, FourNums] | undefined {
        const plyRect: FourNums = [
            ply.x - gameSettings.playerWidth / 2,
            ply.y - gameSettings.playerHeight,
            gameSettings.playerWidth,
            gameSettings.playerHeight,
        ];
        const cp = worldCoordsToChunkCoords(ply.x, ply.y)[0];
        const chunks = this.chunks.filter((c) => Math.abs(c.x - cp[0]) < 3 && Math.abs(c.y - cp[1]) < 3);
        let tempCollide: [BlockStruct, FourNums] | undefined;
        for (const chunk of chunks) {
            for (const blk of chunk.collideData) {
                const blkRect: FourNums = [
                    (chunk.x * CHUNK_SIZE + blk.gx) * gameSettings.blockSize,
                    (chunk.y * CHUNK_SIZE + blk.gy) * gameSettings.blockSize,
                    gameSettings.blockSize,
                    gameSettings.blockSize,
                ];
                if (rectIntersect(...plyRect, ...blkRect)) {
                    if (getBlockData(blk.type).isPlatform) {
                        const isMovingDown = ply.y > lastPos[1];
                        if (isMovingDown && lastPos[1] < blkRect[1]) {
                            tempCollide = [blk, blkRect];
                        }
                    } else {
                        return [blk, blkRect];
                    }
                }
            }
        }
        return tempCollide;
    }

    playerLadderCheck(ply: ClientPlayerState) {
        return false;
        // todo: make it work w chunks
        /* const plyRect: FourNums = [
            ply.x - gameSettings.playerWidth / 2,
            ply.y - gameSettings.playerHeight,
            gameSettings.playerWidth,
            gameSettings.playerHeight,
        ];
        let currentLadder = this.blocks.find((b) => {
            let d = getBlockData(b.type);
            if (!d.isLadder) return;
            let wp = getWorldPos([b.gx, b.gy]);
            if (rectIntersect(...plyRect, ...wp, gameSettings.blockSize, gameSettings.blockSize)) {
                return true;
            }
            return false;
        });
        if (currentLadder) return true;
        return false; */
    }

    serialize() {
        let out = [];
        for (const chunk of this.chunks) {
            out.push(chunk.serialize());
        }
        return out.join("\n");
    }

    static deserialize(worldData: string) {
        const world = new World();

        const lines = worldData.split("\n");
        for (const line of lines) {
            const chunk = Chunk.deserialize(line);
            world.chunks.push(chunk);
        }

        return world;
    }
}

export let world = new World();
