import { d } from "../engine/engine";
import { GameObject } from "../engine/object";

export class HCRect extends GameObject {
    w: number = 400;
    h: number = 300;

    constructor() {
        super();
    }

    draw() {
        d.rect(this.x, this.y, this.w, this.h, this.color);
    }
}
