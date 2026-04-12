import { TwoNums } from "../../lib/engine/utils";
import { PacketString } from "../handlers";
import { PACKET } from "../net/packets";
import { Block, BlockStruct, getBlockData } from "./blocks";
import { cacheChunk } from "./chunkrenderer";
import { socket } from "./game";
import { gameSettings } from "./settings";
import { world } from "./world";

export const CHUNK_SIZE = 8;

export type ChunkData = BlockStruct[];
export class Chunk {
    x = 0;
    y = 0;
    data: ChunkData = [];
    collideData: ChunkData = [];

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.data = [];
    }

    private _filterCollideData() {
        this.collideData = this.data.filter((b) => {
            let d = getBlockData(b.type);
            return d.collision && b.layer == 1 && !d.isLadder;
        });
        cacheChunk(this);
    }

    getBlock(x: number, y: number, layer: number) {
        return this.data.find((b) => b.gx == x && b.gy == y && b.layer == layer);
    }

    getClosestBlock(x: number, y: number) {
        let filt = this.data.filter((b) => b.gx == x && b.gy == y).sort((a, b) => b.layer - a.layer);
        if (filt.length > 0) return filt[0];
        return undefined;
    }

    setBlock(x: number, y: number, layer: number, type: Block, subtype: number) {
        let blk2 = this.getBlock(x, y, layer);
        if (blk2) {
            blk2.type = type;
            blk2.subtype = subtype;
        } else {
            let blk = new BlockStruct();
            blk.gx = x;
            blk.gy = y;
            blk.layer = layer;
            blk.type = type;
            blk.subtype = subtype;
            this.data.push(blk);
        }
        this._filterCollideData();
    }

    setData(data: ChunkData) {
        this.data = data;
        this._filterCollideData();
    }

    removeBlock(x: number, y: number, layer: number) {
        this.data = this.data.filter((b) => b.gx != x || b.gy != y || b.layer != layer);
        this._filterCollideData();
    }

    serialize() {
        let out = `${this.x},${this.y}:`;

        for (const block of this.data) {
            out += `${block.gx},${block.gy},${block.layer}=${block.type},${block.subtype};`;
        }

        return out;
    }

    static deserialize(chunkData: string) {
        const [coordsString, blockString] = chunkData.split(":");
        const [x, y] = coordsString.split(",").map((n) => parseInt(n));

        let data: ChunkData = [];

        if (blockString.length > 0) {
            const blockData = blockString.split(";");

            for (const blockString of blockData) {
                if (blockString.length == 0) continue;
                const [coordsString, dataString] = blockString.split("=");
                const struct = new BlockStruct();

                const [x, y, layer] = coordsString.split(",").map((n) => parseInt(n));
                struct.gx = x;
                struct.gy = y;
                struct.layer = layer;

                const [type, subtype] = dataString.split(",").map((n) => parseInt(n));
                struct.type = type;
                struct.subtype = subtype;

                data.push(struct);
            }
        }

        let out = new Chunk(x, y);
        out.setData(data);

        return out;
    }
}

export function blockCoordsToChunkCoords(bx: number, by: number): [TwoNums, TwoNums] {
    const cx = Math.floor(bx / CHUNK_SIZE);
    const cy = Math.floor(by / CHUNK_SIZE);
    const scx = bx - cx * CHUNK_SIZE;
    const scy = by - cy * CHUNK_SIZE;
    return [
        [cx, cy],
        [scx, scy],
    ];
}

export function worldCoordsToChunkCoords(wx: number, wy: number): [TwoNums, TwoNums] {
    const bx = Math.floor(wx / gameSettings.blockSize);
    const by = Math.floor(wy / gameSettings.blockSize);
    return blockCoordsToChunkCoords(bx, by);
}

let requestingChunks: string[] = [];
export function serverRequestChunk(cx: number, cy: number) {
    const key = [cx, cy].join(",");
    if (requestingChunks.includes(key)) return;
    requestingChunks.push(key);
    socket.emit(PACKET.CS_CHUNK_REQUEST, key);
}

export function serverChunkHandler(data: PacketString) {
    if (!data) return;

    world.deserializeChunk(data);
}
