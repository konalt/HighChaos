import { d } from "../engine/engine";
import { GameObject } from "../engine/object";
import { Anchor, anchorToCoords } from "../engine/utils";

export class HCRect extends GameObject {
    anchor: Anchor = "tl";
    w: number = 400;
    h: number = 300;

    constructor() {
        super();
    }

    draw() {
        const [bx, by] = anchorToCoords(this.anchor, this.x, this.y, this.w, this.h);
        d.rect(bx, by, this.w, this.h, this.color);
    }
}
