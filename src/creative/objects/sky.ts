import { d, w, h } from "../../engine/engine";
import { GameObject } from "../../engine/object";

export class Sky extends GameObject {
    draw() {
        d.rect(0, 0, w, h, "#226");
    }
}
