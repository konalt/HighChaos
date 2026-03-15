import { CanvasStyle } from "./engine";
import { Scene } from "./scene";

export class GameObject {
    x: number;
    y: number;
    color: CanvasStyle;
    scene: Scene;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.color = "#ffffff";
    }

    draw() {
        // Draw code here
    }

    update() {
        // Update code here
    }

    init() {
        // Init code here
    }

    async load() {
        // Async load code here
    }
}
