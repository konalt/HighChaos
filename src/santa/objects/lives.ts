import { ctx, d, loadImage, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { NULLTEXTURE } from "../../lib/ui/hcimage";

export class LivesDisplay extends GameObject {
    private _img: HTMLImageElement;

    lives = 0;

    constructor() {
        super();

        this._img = NULLTEXTURE;
    }

    draw() {
        ctx.save();
        ctx.translate(w - 20, 20);
        for (let i = 0; i < this.lives; i++) {
            d.quickImage(this._img, 0, 0, 0.6, "tr");
            ctx.translate(-100, 0);
        }
        ctx.restore();
    }

    async load() {
        this._img = await loadImage("santa/baby.png");
    }
}
