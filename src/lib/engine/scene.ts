import { SceneCamera } from "./camera";
import { ctx, d, debugCamera, debugMode, h, w } from "./engine";
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
            this.drawLayer(i);
        }
    }

    debugDraw() {
        let cw = w / this.camera.zoom;
        let ch = h / this.camera.zoom;

        ctx.save();
        debugCamera.transform();

        ctx.translate(this.camera.x - cw / 2, this.camera.y - ch / 2);
        ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);
        for (const [i] of this.layers) {
            if (i >= 0) break;
            this.drawLayer(i);
        }
        ctx.restore();

        ctx.save();
        debugCamera.transform();

        for (const [i] of this.layers) {
            if (i < 0) continue;
            if (i >= UI_LAYER) continue;
            this.drawLayer(i);
        }
        ctx.restore();

        ctx.save();
        debugCamera.transform();

        ctx.translate(this.camera.x - cw / 2, this.camera.y - ch / 2);
        ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);
        for (const [i] of this.layers) {
            if (i < UI_LAYER) continue;
            this.drawLayer(i);
        }
        ctx.restore();

        ctx.save();
        debugCamera.transform();
        d.circ(0, 0, 10, "#aaa");
        d.rect(
            this.camera.x - cw / 2,
            this.camera.y - ch / 2,
            cw,
            ch,
            "transparent",
            "red",
            4 / this.camera.zoom,
            "tl",
        );
        ctx.textBaseline = "bottom";
        d.text(
            this.camera.x + cw / 2 - 5 / this.camera.zoom,
            this.camera.y + ch / 2 - 5 / this.camera.zoom,
            this.camera.constructor.name,
            "red",
            `${108 / this.camera.zoom}px monospace`,
            "right",
        );
        ctx.textBaseline = "top";
        d.text(
            this.camera.x + cw / 2 - 5 / this.camera.zoom,
            this.camera.y - ch / 2 + 5 / this.camera.zoom,
            `Zoom: ${Math.round(this.camera.zoom * 1e4) / 1e4}`,
            "red",
            `${108 / this.camera.zoom}px monospace`,
            "right",
        );
        ctx.restore();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
    }

    drawLayer(layer: number) {
        for (const o of this.layers.get(layer)) {
            if (!o.enabled || !o.visible) continue;
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
