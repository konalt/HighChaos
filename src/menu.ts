import { w, h, d } from "./engine";
import * as c from "./engine";

export default function menu() {
    d.rect(0, 0, w, h, "green");
    d.circ(c.mouseX, c.mouseY, 5, "red");
}
