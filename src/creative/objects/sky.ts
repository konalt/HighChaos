import { d, w, h, ctx } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";

export class Sky extends GameObject {
    private _gradient: CanvasGradient;

    constructor() {
        super();

        this._gradient = ctx.createLinearGradient(0, 0, 0, -10000);
        this._gradient.addColorStop(0, "#87d3ff");
        this._gradient.addColorStop(0.03, "#75ccff");
        this._gradient.addColorStop(0.1, "#0076bb");
        this._gradient.addColorStop(0.4, "#092da3");
        this._gradient.addColorStop(0.7, "#1a0b72");
        this._gradient.addColorStop(1, "#000");
    }

    draw() {
        d.rect(this.scene.camera.x - w / 2, this.scene.camera.y - h / 2, w, h, this._gradient);
    }
}
