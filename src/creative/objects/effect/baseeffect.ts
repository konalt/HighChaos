import { since } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { clamp } from "../../../lib/engine/utils";

export class BaseEffect extends GameObject {
    private _spawnTime: number;
    duration = 200;

    constructor() {
        super();
        this._spawnTime = performance.now();
    }

    t() {
        return clamp(since(this._spawnTime) / this.duration);
    }

    update(): void {
        if (this.t() == 1) {
            this.scene.remove(this);
            this.enabled = false;
        }
    }
}
