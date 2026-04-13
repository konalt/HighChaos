import { currentScene } from "../../lib/engine/engine";
import { PacketString } from "../handlers";
import { BlockBreakEffect } from "../objects/effect/blockbreakeffect";
import { getWorldPos } from "../objects/world";
import { world } from "./world";

export enum Block {
    EMPTY = -1,
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
    name: string;
}

const DEFAULT_BLOCK_DATA: BlockData = {
    transparent: false,
    subtypeMode: "none",
    subtypes: [],
    collision: true,
    isPlatform: false,
    isLadder: false,
    isFurniture: false,
    name: "",
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
            ["Green", "#22610f"],
            ["Cyan", "#188d8d"],
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

export function getBlockData(type: Block) {
    if (BLOCK_DATA[type]) {
        let d = { ...DEFAULT_BLOCK_DATA };
        Object.assign(d, BLOCK_DATA[type]);
        return d;
    } else {
        return DEFAULT_BLOCK_DATA;
    }
}

export function getBlockName(type: Block, subtype: number = 0) {
    let data = getBlockData(type);
    const name = () => {
        if (data.name.length == 0) return Block[type][0].toUpperCase() + Block[type].slice(1).toLowerCase();
        return data.name;
    };
    if (data.subtypeMode == "color") {
        return `${data.subtypes[subtype][0]} ${name()}`;
    } else {
        return name();
    }
}

export class BlockStruct {
    type: Block = Block.DIRT;
    gx: number = 0;
    gy: number = 0;
    layer: number = 0;
    subtype: number = 0;

    constructor() {}
}

export function blockUpdateHandler(packet: PacketString) {
    if (!packet) return;

    const [coordsString, dataString] = packet.split("=");
    const [x, y, layer] = coordsString.split(",").map((n) => parseInt(n));
    const [type, subtype] = dataString.split(",").map((n) => parseInt(n));

    world.setBlock(x, y, layer, type, subtype);
}

export function blockRemoveHandler(packet: PacketString) {
    if (!packet) return;

    const [x, y, layer] = packet.split(",").map((n) => parseInt(n));

    let wp = getWorldPos([x, y]);

    let blk = world.getBlockAt(x, y, layer);
    let effect = new BlockBreakEffect(blk?.type ?? Block.DIRT, blk?.subtype ?? 0, layer == 0);
    effect.x = wp[0];
    effect.y = wp[1];
    currentScene.add(effect);

    world.removeBlock(x, y, layer);
}
