import { GameObject } from "./object";
import { Scene, UI_LAYER } from "./scene";

export enum LayerSpace {
    Background,
    World,
    UI,
}

export class Layer {
    id = 0;
    scene: Scene;
    objects: GameObject[] = [];
    reverseDraw = false;
    reverseUpdate = false;
    space: LayerSpace;

    constructor(scene: Scene, id: number) {
        this.scene = scene;
        this.id = id;

        if (id < 0) {
            this.space = LayerSpace.Background;
        } else if (id < UI_LAYER) {
            this.space = LayerSpace.World;
        } else {
            this.space = LayerSpace.UI;
        }
    }

    add(object: GameObject) {
        object.scene = this.scene;
        object.sceneLayer = this.id;
        this.objects.push(object);
    }

    remove(object: GameObject) {
        this.objects = this.objects.filter((o) => o != object);
    }

    forEachObject(cb: (o: GameObject) => void, reverse = false, mustBeEnabled = true) {
        const len = this.objects.length;

        for (let i = 0; i < len; i++) {
            const index = reverse ? len - i - 1 : i;
            const object = this.objects[index];

            if (mustBeEnabled && !object.enabled) continue;

            cb(object);
        }
    }

    fixedUpdate() {
        this.forEachObject((o) => o.fixedUpdate(), this.reverseUpdate);
    }

    update() {
        this.forEachObject((o) => o.update(), this.reverseUpdate);
    }

    draw() {
        //console.log("hi drawing these " + this.objects.length, this.reverseDraw, this.id);

        this.forEachObject((o) => {
            if (o.visible) o.draw();
        }, this.reverseDraw);
    }

    async init() {
        await Promise.all(this.objects.map((o) => o.load()));

        this.forEachObject((o) => {
            o.init();
        });
    }
}
