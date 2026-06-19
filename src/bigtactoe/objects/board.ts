import { d } from "../../lib/engine/engine";
import { anchorToCoords } from "../../lib/engine/utils";
import { HCRect } from "../../lib/ui/hcrect";
import { BTTGameState } from "../types";

const boxSize = 1000;
const padding = 18;
const gap = 10;
const squareSize = (boxSize - padding * 2 - gap * 10) / 9;

export class Board extends HCRect {
    private _bx = 0;
    private _by = 0;

    state: BTTGameState;

    constructor(state: BTTGameState) {
        super();

        this.w = boxSize;
        this.h = boxSize;

        this.state = state;
    }

    private _drawSquare(x: number, y: number) {
        d.roundRect(x, y, squareSize, squareSize, 15, "rgba(0,0,0,0.5)");
    }

    private _drawSquares() {
        let cx = 0;
        let cy = 0;
        for (let mainX = 0; mainX < 3; mainX++) {
            for (let mainY = 0; mainY < 3; mainY++) {
                cx = mainX * (3 * (squareSize + gap) + gap);
                for (let subX = 0; subX < 3; subX++) {
                    cy = mainY * (3 * (squareSize + gap) + gap);
                    for (let subY = 0; subY < 3; subY++) {
                        this._drawSquare(this._bx + padding + cx, this._by + padding + cy);
                        cy += squareSize + gap;
                    }
                    cx += squareSize + gap;
                }
            }
        }
    }

    update(): void {
        [this._bx, this._by] = anchorToCoords("cc", this.x, this.y, this.w, this.h);
    }

    draw(): void {
        d.roundRect(this._bx, this._by, this.w, this.h, 30, "rgba(0,0,0,0.3)");
        this._drawSquares();
    }
}
