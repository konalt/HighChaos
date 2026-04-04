import { d, w, h, ctx } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";

export class Sidebar extends GameObject {
    topWidth: number;
    bottomWidth: number;
    opacity: number;

    constructor() {
        super();
        this.topWidth = w / 3;
        this.bottomWidth = w / 4;
        this.opacity = 0.5;
    }

    draw() {
        ctx.beginPath();

        ctx.moveTo(0, 0);
        ctx.lineTo(this.topWidth, 0);
        ctx.lineTo(this.bottomWidth, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        ctx.fillStyle = `rgba(0,0,0,0,${this.opacity})`;
        ctx.fill();
    }
}
