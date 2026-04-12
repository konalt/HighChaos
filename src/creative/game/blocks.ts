export enum BlockType {
    DIRT,
    GRASS,
    STONE,
    WOOD,
    LEAVES,
    PLANKS,
    GLASS,
    WOOL,
    SAUL,
    BRICKS,
    COBBLESTONE,
    STONEBRICKS,
    TABLE,
    FLOWER,
    LADDER,
    PLATFORM,
    BOOKSHELF,
}

export interface BlockData {
    transparent: boolean;
    subtypeMode: "none" | "color";
    subtypes: string[][];
    collision: boolean;
    isPlatform: boolean;
    isLadder: boolean;
    isFurniture: boolean;
}

const DEFAULT_BLOCK_DATA: BlockData = {
    transparent: false,
    subtypeMode: "none",
    subtypes: [],
    collision: true,
    isPlatform: false,
    isLadder: false,
    isFurniture: false,
};

const BLOCK_DATA: Record<string, Partial<BlockData>> = {
    6: {
        // glass
        transparent: true,
    },
    7: {
        // wool
        subtypeMode: "color",
        subtypes: [
            ["White", "#f9f9f9"],
            ["Light Grey", "#afafaf"],
            ["Dark Grey", "#535353"],
            ["Black", "#1a1a1a"],
            ["Brown", "#58380e"],
            ["Red", "#df2525"],
            ["Orange", "#ec8524"],
            ["Yellow", "#e9d732"],
            ["Lime", "#5bec2f"],
            ["Green", "#168616"],
            ["Cyan", "#22d4ae"],
            ["Light Blue", "#2be1e7"],
            ["Dark Blue", "#264cca"],
            ["Purple", "#982fdd"],
            ["Magenta", "#e334f3"],
            ["Pink", "#ffa0ff"],
        ],
    },
    12: {
        isFurniture: true,
        collision: false,
        transparent: true,
    },
    13: {
        // flower
        collision: false,
        transparent: true,
    },
    14: {
        // ladder
        transparent: true,
        isLadder: true,
    },
    15: {
        // playform
        transparent: true,
        isPlatform: true,
    },
};

export function getBlockData(type: BlockType) {
    if (BLOCK_DATA[type]) {
        let d = { ...DEFAULT_BLOCK_DATA };
        Object.assign(d, BLOCK_DATA[type]);
        return d;
    } else {
        return DEFAULT_BLOCK_DATA;
    }
}

export class BlockStruct {
    type: BlockType = BlockType.DIRT;
    gx: number = 0;
    gy: number = 0;
    layer: number = 0;
    subtype: number = 0;

    constructor() {}
}

export let blocks: BlockStruct[] = [];
export let culledBlocks: BlockStruct[] = [];
export let collideBlocks: BlockStruct[] = [];

export function filterCollideBlocks() {
    collideBlocks = blocks.filter((b) => {
        let d = getBlockData(b.type);
        return d.collision && b.layer == 1 && !d.isLadder;
    });
}

export function cullBlocks() {
    let c: BlockStruct[] = [];

    for (const b of blocks) {
        let b2 = c.find((b3) => b3.gx == b.gx && b3.gy == b.gy);
        if (!b2) {
            c.push(b);
            continue;
        }
        if (b2.layer == b.layer) {
            console.warn(`multiple blocks stacked @ ${b.gx},${b.gy},${b.layer}!`);
            continue;
        }
        if (b2.layer < b.layer) {
            if (!getBlockData(b.type).transparent) c = c.filter((b3) => b3.gx != b.gx || b3.gy != b.gy);
            c.push(b);
        }
    }

    culledBlocks = c;
}

export function setBlocks(bs: BlockStruct[]) {
    blocks = bs;

    cullBlocks();
    filterCollideBlocks();
}

export function setBlock(bs: BlockStruct) {
    let cBlock = blocks.find((b) => b.gx == bs.gx && b.gy == bs.gy && b.layer == bs.layer);

    if (cBlock) {
        cBlock = bs;
    } else {
        blocks.push(bs);
    }

    cullBlocks();
    filterCollideBlocks();
}

export function removeBlock(x: number, y: number, layer: number) {
    blocks = blocks.filter((b) => b.gx != x || b.gy != y || b.layer != layer);

    cullBlocks();
    filterCollideBlocks();
}

export function getBlockAt(x: number, y: number, layer: number) {
    return blocks.find((b) => b.gx == x && b.gy == y && b.layer == layer);
}

export function getClosestBlockAt(x: number, y: number) {
    let filt = blocks.filter((b) => b.gx == x && b.gy == y).sort((a, b) => b.layer - a.layer);
    if (filt.length > 0) return filt[0];
    return undefined;
}
