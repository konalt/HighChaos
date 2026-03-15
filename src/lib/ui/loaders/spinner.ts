import { ctx, d, globalTimer } from "../../engine/engine";
import { GameObject } from "../../engine/object";

export class SpinnerLoader extends GameObject {
    private startAngle = 0;
    private endAngle = this.startAngle + Math.PI / 2;

    majorRadius: number;
    minorRadius: number;
    speed: number;

    // I have no idea what these numbers do. I chucked them into an equation and it looked nice. Mess about if you like.
    // sinFactor > linearFactor makes it jiggle a bit though.
    sinFactor: number;
    linearFactor: number;

    constructor() {
        super();

        this.majorRadius = 60;
        this.minorRadius = 10;
        this.speed = 1;

        this.sinFactor = 0.5;
        this.linearFactor = 0.5;
    }

    update(): void {
        let x = globalTimer;

        this.startAngle =
            x * this.speed * 0.008 * this.linearFactor + Math.sin(this.speed * 0.008 * x + Math.PI) * this.sinFactor;
        this.endAngle = this.startAngle + Math.PI / 2;
    }

    draw() {
        // Set up
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.minorRadius;

        // 1st iteration
        ctx.beginPath();
        ctx.arc(0, 0, this.majorRadius, this.startAngle, this.endAngle);
        ctx.stroke();

        // 2nd iteration: 180° rotation
        ctx.beginPath();
        ctx.arc(0, 0, this.majorRadius, this.startAngle + Math.PI, this.endAngle + Math.PI);
        ctx.stroke();

        // Clean up
        ctx.restore();
    }
}
