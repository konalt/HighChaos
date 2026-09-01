import { ctx, font, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { createOffscreenCanvas } from "../../../lib/engine/utils";

export class CAHInGameVoteText extends GameObject {
    private _rendered: ImageBitmap;

    readonly width: number;
    readonly height: number;

    constructor(text: string) {
        super();

        this._rendered = this._render(text);

        this.width = this._rendered.width;
        this.height = this._rendered.height;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.drawImage(this._rendered, -this.width / 2, -this.height / 2);

        ctx.restore();
    }

    private _render(text: string) {
        const [c, ctx] = createOffscreenCanvas(w, 120);

        // canvas setup
        ctx.font = font(90, "700");
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 8;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.strokeText(text, w / 2, c.height / 2, w);
        ctx.fillText(text, w / 2, c.height / 2, w);

        return c.transferToImageBitmap();
    }
}
