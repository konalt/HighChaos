import { ctx, d, getMouse, h, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { COLOR } from "../../color";

export class CAHBackground extends GameObject {
    private _grad: CanvasGradient;

    constructor() {
        super();

        this._grad = this._createGradient();
    }

    draw() {
        ctx.save();
        ctx.translate(...getMouse(true));
        d.rect(-w, -h, w * 2, h * 2, this._grad);
        ctx.restore();
    }

    private _createGradient() {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.6);

        // color stops
        g.addColorStop(0, COLOR.backgroundLight);
        g.addColorStop(1, COLOR.backgroundDark);

        return g;
    }
}
