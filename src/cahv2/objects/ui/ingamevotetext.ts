import { ctx, font, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { createOffscreenCanvas } from "../../../lib/engine/utils";

const FlipDuration = 300;

export class CAHInGameVoteText extends GameObject {
    private _rendered1: ImageBitmap;
    private _rendered2: ImageBitmap;

    readonly width: number;
    readonly height: number;

    constructor(text1: string, text2: string) {
        super();

        this._rendered1 = this._render(text1);
        this._rendered2 = this._render(text2);

        this.width = Math.max(this._rendered1.width, this._rendered2.width);
        this.height = Math.max(this._rendered1.height, this._rendered2.height);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this._flipScaleFactor, 1);

        let img = this._flip > 0.5 && this._flip < 1.5 ? this._rendered2 : this._rendered1;

        ctx.drawImage(img, -this.width / 2, -this.height / 2);

        ctx.restore();
    }

    update(): void {
        // flip timers
        if (this._isFlipping) {
            this._flip = this._flipOrigin + this.objTimer(`flip`, true);
        }

        // for when the flipping ends
        this.objTimerEnd(`flip`, () => {
            this._isFlipping = false;
        });

        this.recalculateFlipShit();
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

    //#region flip stuff
    private _flip = 0;
    private _isFlipping = false;
    private _flipOrigin = 0;
    private _flipScaleFactor = 0;

    private recalculateFlipShit() {
        // fix flipping if it needs to be
        if (this._flip >= 2) {
            this._flip %= 2;
        }

        // calculate flip scale factor
        this._flipScaleFactor = Math.abs(Math.cos(this._flip * Math.PI));
    }

    flip(duration = FlipDuration) {
        // if already flipping, ignore
        if (this._isFlipping) return;

        this._isFlipping = true;
        this._flipOrigin = Math.floor(this._flip);

        this.objStartTimer(`flip`, duration);
    }

    flipFaceDown(duration = FlipDuration) {
        if (Math.floor(this._flip) == 1) return;

        this.flip(duration);
    }

    flipFaceUp(duration = FlipDuration) {
        if (Math.floor(this._flip) == 0) return;

        this.flip(duration);
    }

    setFlip(value: number) {
        this.objRemoveTimer(`flip`);
        this._isFlipping = false;
        this._flip = value;

        this.recalculateFlipShit();
    }
    //#endregion
}
