import { d, w, h, ctx, getMouse } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";

export class Sidebar extends GameObject {
    width: number;
    opacity: number;

    constructor() {
        super();
        this.width = w / 3;
        this.opacity = 0.5;
    }

    draw() {
        d.rect(w / 2, 0, this.width, h, `rgba(0,0,0,${this.opacity})`, "", 0, "tc");
    }
}
