import { TwoNums } from "../lib/engine/utils";

export type BTTPlayer = "o" | "x";

export type BTTGridSquare = BTTPlayer | null;

export type BTTGameSubgridLine = [BTTGridSquare, BTTGridSquare, BTTGridSquare];
export type BTTGameSubgrid = [BTTGameSubgridLine, BTTGameSubgridLine, BTTGameSubgridLine];
export type BTTGameGridLine = [BTTGameSubgrid, BTTGameSubgrid, BTTGameSubgrid];
export type BTTGameGrid = [BTTGameGridLine, BTTGameGridLine, BTTGameGridLine];

export interface BTTGameState {
    nextGrid: TwoNums | null;
    nextTurn: BTTPlayer;
    fullGrids: TwoNums[];
    grid: BTTGameGrid;
}

export function createSubgrid(): BTTGameSubgrid {
    const createSubgridLine = () => {
        return [null, null, null] as BTTGameSubgridLine;
    };
    return [createSubgridLine(), createSubgridLine(), createSubgridLine()];
}

export function createGrid(): BTTGameGrid {
    const createGridLine = () => {
        return [createSubgrid(), createSubgrid(), createSubgrid()] as BTTGameGridLine;
    };
    return [createGridLine(), createGridLine(), createGridLine()];
}
