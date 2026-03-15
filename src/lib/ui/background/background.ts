import { CanvasStyle, d, h, w } from "../../engine/engine";
import { GameObject } from "../../engine/object";
import { GradientType } from "../../engine/utils";

export class Background extends GameObject {
    color1: string;

    constructor() {
        super();
    }

    draw() {
        d.rect(0, 0, w, h, this.color);
    }
}
