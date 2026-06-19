import { ctx, d, h, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { COLOR } from "../../color";

export class CAHBackground extends GameObject {
    private _grad: CanvasGradient;

    constructor() {
        super();

        this._grad = this._createGradient();
    }

    draw() {
        d.rect(0, 0, w, h, this._grad);
    }

    private _createGradient() {
        // center at [0, h*1.5]
        // radius is w
        const g = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.6);

        // color stops
        g.addColorStop(0, COLOR.backgroundLight);
        g.addColorStop(1, COLOR.backgroundDark);

        return g;
    }
}
