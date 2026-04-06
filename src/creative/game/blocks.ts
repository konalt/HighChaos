export enum BlockType {
    DIRT,
    GRASS,
    STONE,
    WOOD,
    LEAVES,
    PLANKS,
}

export class BlockStruct {
    type: BlockType = BlockType.DIRT;
    gx: number = 0;
    gy: number = 0;
    layer: number = 0;

    constructor() {}
}

export let blocks: BlockStruct[] = [];

export function setBlocks(bs: BlockStruct[]) {
    blocks = bs;
}

export function setBlock(bs: BlockStruct) {
    let cBlock = blocks.find((b) => b.gx == bs.gx && b.gy == bs.gy && b.layer == bs.layer);

    if (cBlock) {
        cBlock = bs;
    } else {
        blocks.push(bs);
    }
}

export function removeBlock(x: number, y: number, layer: number) {
    blocks = blocks.filter((b) => b.gx != x || b.gy != y || b.layer != layer);
}

export function getBlockAt(x: number, y: number, layer: number) {
    return blocks.find((b) => b.gx == x && b.gy == y && b.layer == layer);
}

export function getClosestBlockAt(x: number, y: number) {
    let filt = blocks.filter((b) => b.gx == x && b.gy == y).sort((a, b) => b.layer - a.layer);
    if (filt.length > 0) return filt[0];
    return undefined;
}
