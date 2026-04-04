import { ctx, CursorMode, d, getKeyDown, getMouse, setCursorMode } from "../engine/engine";
import { GameObject } from "../engine/object";
import { Anchor, anchorToCoords, basicPointInRect, clamp, grey, lerp } from "../engine/utils";

export class HCButton extends GameObject {
    // Hover storage
    private _hovered = false;
    private _hoverTransition = 0;
    private _clicked = false;

    // Bounding box
    private _bx = 0;
    private _by = 0;
    private _bw = 0;
    private _bh = 0;

    // Properties
    text = "Button";
    anchor: Anchor = "cc";
    onClick: () => void;

    // Styling
    padding = 10;
    round: number | "capsule" = 10;
    font = "24px serif";
    hoverAnimationSpeed = 0.3;

    // Yeah
    needsUpdate = true;

    constructor() {
        super();

        this.onClick = () => {};
    }

    update(): void {
        super.update();

        ctx.textBaseline = "top";
        ctx.font = this.font;

        if (this.needsUpdate) {
            let measure = ctx.measureText(this.text);
            this._bw = measure.width + this.padding * 2;
            this._bh = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent + this.padding * 2;

            let [bx, by] = anchorToCoords(this.anchor, this.x, this.y, this._bw, this._bh);
            this._bx = bx;
            this._by = by;

            this.needsUpdate = false;
        }

        // reset clicked variable - should only be true for 1 frame
        if (this._clicked) this._clicked = false;

        // check if mouse is hovering over button
        let mouse = getMouse();
        this._hovered = basicPointInRect(...mouse, this._bx, this._by, this._bw, this._bh);

        if (this._hovered) {
            this._hoverTransition += this.hoverAnimationSpeed;
            setCursorMode(CursorMode.Click);
            if (getKeyDown("mouse1")) {
                this.onClick();
                this._clicked = true;
            }
        } else {
            this._hoverTransition -= this.hoverAnimationSpeed;
        }

        this._hoverTransition = clamp(this._hoverTransition);
    }

    draw() {
        let color = grey(lerp(this._hoverTransition, 1, 0.75));

        ctx.textBaseline = "top";

        d.roundRect(
            this._bx,
            this._by,
            this._bw,
            this._bh,
            this.round == "capsule" ? Math.min(this._bw, this._bh) / 2 : this.round,
            color,
        );

        d.text(this._bx + this.padding, this._by + this.padding, this.text, "black", this.font, "left");
    }
}
