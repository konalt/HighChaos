import { SceneCamera } from "./camera";
import { ctx } from "./engine";
import { GameObject } from "./object";

export const UI_LAYER = 1000;

export class Scene {
    layers: Map<number, GameObject[]>;
    camera: SceneCamera;

    constructor() {
        this.layers = new Map();
        this.camera = new SceneCamera();
    }

    private _sortLayers() {
        // layers must be sorted for correct drawing order
        this.layers = new Map(Array.from(this.layers).sort((a, b) => a[0] - b[0]));
    }

    add(object: GameObject, layer = 0) {
        if (!this.layers.get(layer)) {
            this.layers.set(layer, []);
            this._sortLayers();
        }
        object.scene = this;
        object.sceneLayer = layer;
        this.layers.get(layer).push(object);
    }

    remove(object: GameObject) {
        this.layers.set(
            object.sceneLayer,
            this.layers.get(object.sceneLayer).filter((o) => o != object),
        );
    }

    update() {
        for (const [i] of this.layers) {
            this.updateLayer(i);
        }
    }

    updateLayer(layer: number) {
        for (const o of this.layers.get(layer)) {
            if (!o.enabled) continue;
            o.update();
        }
    }

    draw() {
        // draw layers < 0 before camera transform
        for (const [i] of this.layers) {
            if (i >= 0) break;
            this.drawLayer(i);
        }

        ctx.save();
        this.camera.transform();

        for (const [i] of this.layers) {
            if (i < 0) continue;
            if (i >= UI_LAYER) continue;
            this.drawLayer(i);
        }

        ctx.restore();

        for (const [i] of this.layers) {
            if (i < UI_LAYER) continue;
            if (i >= UI_LAYER) continue;
            this.drawLayer(i);
        }
    }

    drawLayer(layer: number) {
        for (const o of this.layers.get(layer)) {
            if (!o.enabled) continue;
            o.draw();
        }
    }

    async init(data?: Record<string, any>) {
        for (const [i] of this.layers) {
            await this.initLayer(i, data);
        }
    }

    async initLayer(layer: number, data?: Record<string, any>) {
        await Promise.all(this.layers.get(layer).map((o) => o.load()));

        for (const o of this.layers.get(layer)) {
            o.init();
        }
    }
}
