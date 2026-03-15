import { ctx, d, globalTimer } from "../../engine/engine";
import { GameObject } from "../../engine/object";
import { TAU } from "../../engine/utils";

const r_a = 40;
const r_b = 10;

const angleDiff = Math.PI / 2;

const slopeFactor = 0.6;
const sinFactor = 0.5;

const a = 1;
const s = 0.008;
const r = 1;

export class SpinnerLoader extends GameObject {
    private startAngle = 0;
    private endAngle = this.startAngle + angleDiff;
    constructor() {
        super();
    }

    update(): void {
        let x = globalTimer;

        this.startAngle = a * s * x + Math.sin(s * x + Math.PI) * r;
        this.endAngle = this.startAngle + Math.PI / 2;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.strokeStyle = "#fff";
        //ctx.lineCap = "round";
        ctx.lineWidth = r_b;

        ctx.beginPath();
        ctx.arc(0, 0, r_a, this.startAngle, this.endAngle);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, r_a, this.startAngle + Math.PI, this.endAngle + Math.PI);
        ctx.stroke();

        ctx.restore();
    }
}
