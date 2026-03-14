import { d } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { Scene } from "../../lib/engine/scene";

// Lifecycle:
// constructor -> load -> init
// update is run before draw

export class ExampleObject extends GameObject {
    // Properties go here

    constructor() {
        super();

        // Custom shit goes here
    }

    // Custom methods go here

    update() {
        // Update code goes here (if needed)
    }

    draw() {
        // Drawing code goes here
        d.rect(this.x, this.y, 50, 50, "red");
    }

    init() {
        // Init code goes here (if needed)
    }

    async load() {
        // Async loading code goes here (if needed)
    }
}
