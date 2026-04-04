export enum BlockType {
    DIRT,
    GRASS,
    STONE,
    WOOD,
    LEAVES,
}

export class BlockStruct {
    type: BlockType = BlockType.DIRT;
    gx: number = 0;
    gy: number = 0;

    constructor() {}
}

export let blocks: BlockStruct[] = [];

export function setBlocks(bs: BlockStruct[]) {
    blocks = bs;
}

export function setBlock(bs: BlockStruct) {
    let cBlock = blocks.find((b) => b.gx == bs.gx && b.gy == bs.gy);

    if (cBlock) {
        cBlock = bs;
    } else {
        blocks.push(bs);
    }
}

export function removeBlock(x: number, y: number) {
    blocks = blocks.filter((b) => b.gx != x || b.gy != y);
}
