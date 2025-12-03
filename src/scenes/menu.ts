import { w, h, d } from "../engine";
import * as c from "../engine";

export function draw() {
    d.rect(0, 0, w, h, "green");
    d.circ(c.mouseX, c.mouseY, 5, "red");
}

export function init() {}
