import { d, h } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";

export class Hills extends GameObject {
    // Properties go here

    constructor() {
        super();
    }

    draw() {
        d.circ(1500, h + 1300, 1500, "#cfcfcfff");
        d.circ(600, h + 1700, 1900, "#e2e2e2ff");
    }
}
