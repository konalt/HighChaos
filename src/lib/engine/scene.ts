import { SceneCamera } from "./camera";
import { ctx, d, debugCamera, debugMode, getKeyDown, h, w } from "./engine";
import { Layer, LayerSpace } from "./layer";
import { GameObject } from "./object";

export const UI_LAYER = 1000;

export class Scene {
    layers: Map<number, Layer>;
    camera: SceneCamera;
    reverseUpdate = false;
    reverseDraw = false;

    private _sortedLayersUpdate: Layer[] = [];
    private _sortedLayersDraw: Layer[] = [];

    constructor() {
        this.layers = new Map();
        this.camera = new SceneCamera();
    }

    private _sortLayers() {
        // layers must be sorted for correct drawing order
        this._sortedLayersDraw = Array.from(this.layers)
            .sort((a, b) => (this.reverseDraw ? b[0] - a[0] : a[0] - b[0]))
            .map(([_, l]) => l);
        this._sortedLayersUpdate = Array.from(this.layers)
            .sort((a, b) => (this.reverseUpdate ? b[0] - a[0] : a[0] - b[0]))
            .map(([_, l]) => l);
    }

    addLayer(id: number) {
        let layer = new Layer(this, id);
        layer.reverseUpdate = this.reverseUpdate;
        layer.reverseDraw = this.reverseDraw;
        this.layers.set(id, layer);
        this._sortLayers();
        return layer;
    }

    add(object: GameObject, layerId = 0) {
        //console.log(`adding ${object.constructor.name} to layer ${layerId}`);

        let layer = this.layers.get(layerId);
        if (!layer) {
            layer = this.addLayer(layerId);
        }
        layer.add(object);
    }

    remove(object: GameObject) {
        const l = this.layers.get(object.sceneLayer);

        if (!l) {
            throw "tried to remove object from nonexistent layer";
        }

        l.remove(object);
    }

    fixedUpdate() {
        for (const layer of this._sortedLayersUpdate) {
            layer.fixedUpdate();
        }
    }

    update() {
        for (const layer of this._sortedLayersUpdate) {
            layer.update();
        }

        if (getKeyDown("keyp")) {
            console.log(this.layers);
        }
    }

    draw() {
        // draw layers in bg space before camera transform
        for (const layer of this._sortedLayersDraw) {
            if (layer.space == LayerSpace.Background) {
                layer.draw();
            }
        }

        ctx.save();
        this.camera.transform();

        // draw world space layers
        for (const layer of this._sortedLayersDraw) {
            if (layer.space == LayerSpace.World) {
                layer.draw();
            }
        }

        ctx.restore();

        // draw ui layers
        for (const layer of this._sortedLayersDraw) {
            if (layer.space == LayerSpace.UI) {
                layer.draw();
            }
        }
    }

    debugDraw() {
        let cw = w / this.camera.zoom;
        let ch = h / this.camera.zoom;

        ctx.save();
        debugCamera.transform();

        ctx.translate(this.camera.x - cw / 2, this.camera.y - ch / 2);
        ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);
        for (const [_, layer] of this.layers) {
            if (layer.space == LayerSpace.Background) {
                layer.draw();
            }
        }
        ctx.restore();

        ctx.save();
        debugCamera.transform();

        for (const [_, layer] of this.layers) {
            if (layer.space == LayerSpace.World) {
                layer.draw();
            }
        }
        ctx.restore();

        ctx.save();
        debugCamera.transform();

        ctx.translate(this.camera.x - cw / 2, this.camera.y - ch / 2);
        ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);
        for (const [_, layer] of this.layers) {
            if (layer.space == LayerSpace.UI) {
                layer.draw();
            }
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

    async init(data?: any) {
        for (const [_, layer] of this.layers) {
            await layer.init();
        }
    }
}
