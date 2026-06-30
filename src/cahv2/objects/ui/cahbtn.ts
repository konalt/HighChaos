import { CanvasStyle, ctx, debugMode, font, h, w } from "../../../lib/engine/engine";
import { Anchor, anchorToCoords, lerp } from "../../../lib/engine/utils";
import { Clickable } from "../../../lib/ui/clickable";

export class CAHButton extends Clickable {
    private _textImg: ImageBitmap;

    padding = 10;
    anchor: Anchor = "tl";
    background: CanvasStyle = "#727272";
    border: CanvasStyle = "#999999";
    disabled = false;

    constructor(text: string, fontSize = 40) {
        super();

        this.hoverAnimationSpeed = 0.14;

        this._text = text;
        this._fontSize = fontSize;

        this._textImg = this._createText(text, fontSize);

        this.bw = this._textImg.width + this.padding * 2;
        this.bh = this._textImg.height + this.padding * 2;
        [this.bx, this.by] = anchorToCoords(this.anchor, this.x, this.y, this.bw, this.bh);
    }

    private _regen() {
        this._textImg = this._createText(this._text, this._fontSize);

        this.bw = this._textImg.width + this.padding * 2;
        this.bh = this._textImg.height + this.padding * 2;
        [this.bx, this.by] = anchorToCoords(this.anchor, this.x, this.y, this.bw, this.bh);
    }

    private _text = "Click Me";
    private _fontSize = 40;

    set text(t: string) {
        this._text = t;
        this._regen();
    }

    set fontSize(s: number) {
        this._fontSize = s;
        this._regen();
    }

    private _createText(t: string, fontSize: number) {
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = font(fontSize);

        const measure = ctx.measureText(t);

        const canvas = new OffscreenCanvas(measure.width + 10, measure.actualBoundingBoxDescent + 10);
        const octx = canvas.getContext("2d");

        if (!octx) throw new Error(":3");

        octx.textAlign = "left";
        octx.textBaseline = "top";
        octx.font = font(fontSize);

        octx.fillStyle = "white";
        octx.fillText(t, 5, 5);

        return canvas.transferToImageBitmap();
    }

    update(): void {
        super.update();

        [this.bx, this.by] = anchorToCoords(this.anchor, this.x, this.y, this.bw, this.bh);

        this.ignore = this.disabled;
    }

    draw() {
        ctx.save();

        ctx.fillStyle = this.background;
        ctx.strokeStyle = this.border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.bx, this.by, this.bw, this.bh, 5);
        ctx.globalAlpha = lerp(this.hoverTransition, 0.3, 0.75);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();

        ctx.drawImage(this._textImg, this.bx + this.padding, this.by + this.padding);

        if (this.disabled) {
            ctx.fillStyle = "#0000008c";
            ctx.fill();
        }

        ctx.restore();
    }
}
