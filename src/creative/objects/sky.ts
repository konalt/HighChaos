import { d, w, h } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";

export class Sky extends GameObject {
    draw() {
        d.rect(0, 0, w, h, "#226");
    }
}
