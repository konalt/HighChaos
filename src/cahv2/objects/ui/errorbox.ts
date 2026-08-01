import { easeInOutCirc, easeOutCirc, easeOutQuad } from "../../../lib/engine/ease";
import { ctx, d, font, h, startTimer, timer, timerEnd, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";

const Background = "#e63333";
const Foreground = "#f8f8f8";
const TransitionDuration = 300;
const FontSize = 32;
const Padding = 18;

export class CAHErrorBox extends GameObject {
    private _bh = 0;
    private _y = 0;
    private _text = "Unknowable Mysterious Error";
    private _curDur = 0;
    private _stage = 0;

    constructor() {
        super();
    }

    draw() {
        if (this._stage == 0) return;

        ctx.save();
        ctx.translate(0, this._y);

        d.roundRect(0, 0, w, this._bh + Padding, Padding, Background);

        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = Foreground;
        ctx.font = font(FontSize);
        ctx.fillText(this._text, Padding, Padding);

        ctx.restore();
    }

    update() {
        super.update();
        ctx.font = font(FontSize);
        ctx.textBaseline = "top";

        this._bh = ctx.measureText(this._text).actualBoundingBoxDescent + Padding * 2;

        let t = 0;
        switch (this._stage) {
            case 0:
                t = 0;
                break;
            case 1:
                t = easeOutQuad(timer(`show${this.uuid}`));
                break;
            case 2:
                t = 1;
                break;
            case 3:
                t = 1 - easeOutQuad(timer(`hide${this.uuid}`));
                break;
        }
        this._y = h - t * this._bh;

        timerEnd(`show${this.uuid}`, () => {
            this._stage = 2;
            startTimer(`keep${this.uuid}`, this._curDur);
        });

        timerEnd(`keep${this.uuid}`, () => {
            this._stage = 3;
            startTimer(`hide${this.uuid}`, TransitionDuration);
        });

        timerEnd(`hide${this.uuid}`, () => {
            this._stage = 0;
        });
    }

    // show the messag
    show(message: string, duration = 5000) {
        this._text = message;
        this._curDur = duration;
        this._stage = 1;
        startTimer(`show${this.uuid}`, TransitionDuration);
    }
}
