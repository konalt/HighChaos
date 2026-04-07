import { TwoNums } from "../../lib/engine/utils";
import { BlockType } from "./blocks";

let w = 0;

const T = BlockType;

function b(t: BlockType, i = 0): TwoNums {
    return [t, i];
}

function s(t: BlockType, c = 0): TwoNums[] {
    let o: TwoNums[] = [];
    for (let i = 0; i < c; i++) {
        o.push([t, i]);
    }
    return o;
}

export const INVENTORY: TwoNums[] = [
    b(T.GRASS),
    b(T.DIRT),
    b(T.STONE),
    b(T.COBBLESTONE),
    b(T.STONEBRICKS),
    b(T.BRICKS),
    b(T.WOOD),
    b(T.LEAVES),
    b(T.PLANKS),
    b(T.GLASS),
    b(T.LADDER),
    b(T.PLATFORM),
    ...s(T.WOOL, 16),
    b(T.TABLE),
    b(T.FLOWER),
    b(T.SAUL),
];
