import { CanvasStyle, d, h, w } from "../engine/engine";
import { GameObject } from "../engine/object";

export class Background extends GameObject {
    color: CanvasStyle;

    constructor() {
        super();

        this.color = "#000";
    }

    draw() {
        d.rect(0, 0, w, h, this.color);
    }
}
