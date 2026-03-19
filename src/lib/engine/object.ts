import { CanvasStyle } from "./engine";
import { Scene } from "./scene";

export class GameObject {
    x: number;
    y: number;
    color: CanvasStyle;
    scene: Scene;
    sceneLayer: number;
    enabled: boolean;
    visible: boolean;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.color = "#ffffff";
        this.enabled = true;
        this.visible = true;
    }

    draw() {
        // Draw code here
    }

    update() {
        // Update code here
    }

    fixedUpdate() {
        // Fixed update goes here
    }

    init() {
        // Init code here
    }

    async load() {
        // Async load code here
    }
}
