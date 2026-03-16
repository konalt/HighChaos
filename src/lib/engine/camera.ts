import { ctx, h, w } from "./engine";

export class SceneCamera {
    x: number;
    y: number;
    zoom: number;

    constructor() {
        this.x = w / 2;
        this.y = h / 2;
        this.zoom = 1;
    }

    transform() {
        ctx.translate(-this.x * this.zoom + w / 2, -this.y * this.zoom + h / 2);
        ctx.scale(this.zoom, this.zoom);
    }

    inverse() {
        ctx.translate(this.x * this.zoom + w / 2, this.y * this.zoom + h / 2);
        ctx.scale(1 / this.zoom, 1 / this.zoom);
    }
}
