import { ctx, deltaTime, h, loadImage, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { NULLTEXTURE } from "../../../lib/ui/hcimage";

export class ASGScrollingBackground extends GameObject {
    private _img = NULLTEXTURE;
    private _src = "";
    private _scrollPos = 0;

    scrollSpeed = 50;

    constructor(src: string) {
        super();
        this._src = src;
    }

    update() {
        this._scrollPos += this.scrollSpeed * deltaTime;
        this._scrollPos %= h;
    }

    draw() {
        ctx.drawImage(this._img, 0, this._scrollPos - h, w, h * 2);
    }

    async load() {
        this._img = await loadImage(this._src);
    }
}
