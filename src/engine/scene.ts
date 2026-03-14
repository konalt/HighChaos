import { GameObject } from "./object";

export class Scene {
    objects: GameObject[];
    constructor() {
        this.objects = [];
    }

    add(object: GameObject) {
        object.scene = this;
        this.objects.push(object);
    }

    remove(object: GameObject) {
        this.objects.filter((o) => o != object);
    }

    update() {
        for (const o of this.objects) {
            o.update();
        }
    }

    draw() {
        for (const o of this.objects) {
            o.draw();
        }
    }

    async init(data?: Record<string, any>) {
        await Promise.all(this.objects.map((o) => o.load()));

        for (const o of this.objects) {
            o.init();
        }
    }
}
