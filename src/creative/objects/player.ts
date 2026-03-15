import { d } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";

export class PlayerObject extends GameObject {
    constructor() {
        super();
    }

    draw() {
        d.rect(this.x, this.y, 30, 100, "white", "", 0, "bc");
    }
}
