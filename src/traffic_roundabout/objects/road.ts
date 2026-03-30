import { ctx, d } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { Scene } from "../../lib/engine/scene";
import { getAngle } from "../../lib/engine/utils";

export const LaneWidth = 80;
export const LineDash = [60, 60];

const RoadColor = "#4e4e4e";
const PaintWhite = "#cfcfcf";
const PaintYellow = "#f0e337";

export class Road extends GameObject {
    startX: number;
    startY: number;
    endX: number;
    endY: number;

    lanes: number;

    private _angle = 0;
    private _width = 0;
    private _height = 0;
    recalculate: boolean;

    constructor() {
        super();

        this.startX = 0;
        this.startY = 0;
        this.endX = 400;
        this.endY = 400;
        this.lanes = 3;

        this.recalculate = true;
    }

    // Custom methods go here

    update() {
        if (this.recalculate) {
            this._angle = getAngle(this.startX, this.startY, this.endX, this.endY);
            this._width = this.endX - this.startX;
            this._height = this.lanes * LaneWidth;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.startX, this.startY);
        ctx.rotate(this._angle);

        d.rect(0, 0, this._width, this._height, RoadColor, "", 0, "cl");

        ctx.setLineDash(LineDash);
        ctx.lineWidth = 6;
        ctx.strokeStyle = PaintWhite;
        let cy = -this._height / 2;
        for (let i = 0; i < this.lanes - 1; i++) {
            cy += LaneWidth;
            ctx.beginPath();
            ctx.moveTo(0, cy);
            ctx.lineTo(this._width, cy);
            ctx.stroke();
        }

        ctx.restore();
    }

    init() {
        // Init code goes here (if needed)
    }

    async load() {
        // Async loading code goes here (if needed)
    }
}
