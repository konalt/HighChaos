import { ctx, d, font, getMouse } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { clamp, TwoNums } from "../../../lib/engine/utils";
import { UI_COLOR } from "../../game/game";

const OFFSET = 40;
const PADDING = 10;

export class Tooltip extends GameObject {
    private _mouse: TwoNums = [0, 0];
    private _showValue = 0;

    show = false;
    text = "Text";

    constructor() {
        super();
    }

    update() {
        super.update();
        this._mouse = getMouse(true);
        this.x = this._mouse[0];
        this.y = this._mouse[1];

        if (this.show) {
            this._showValue += 0.1;
        } else {
            this._showValue -= 0.1;
        }

        this._showValue = clamp(this._showValue);
    }

    draw() {
        if (this._showValue == 0) return;

        ctx.save();

        ctx.globalAlpha = this._showValue;
        ctx.font = font(18);
        ctx.textBaseline = "middle";

        let measure = ctx.measureText(this.text);
        let height = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;

        ctx.translate(this.x, this.y - OFFSET);
        d.roundRect(0, 0, measure.width + PADDING * 2, height + PADDING * 2, 5, UI_COLOR, "", 0, "cc");
        d.text(0, 0, this.text, "white", ctx.font, "center");

        ctx.restore();
    }
}
