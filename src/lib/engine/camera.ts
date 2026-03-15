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
        ctx.translate(-this.x + w, -this.y + h);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-w / 2, -h / 2);
    }
}
