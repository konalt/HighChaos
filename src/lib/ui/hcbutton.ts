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
    ignore = false;

    // Styling
    padding = 10;
    round: number | "capsule" = 10;
    font = "24px serif";
    hoverAnimationSpeed = 0.3;
    invert = false;

    // Yeah
    needsUpdate = true;

    constructor() {
        super();

        this.onClick = () => {};
    }

    private _updateBBox() {
        if (this.needsUpdate) {
            ctx.textBaseline = "top";
            console.log(this.font);

            ctx.font = this.font;

            let measure = ctx.measureText(this.text);
            this._bw = measure.width + this.padding * 2;
            this._bh = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + this.padding * 2;

            let [bx, by] = anchorToCoords(this.anchor, this.x, this.y, this._bw, this._bh);
            this._bx = bx;
            this._by = by;

            this.needsUpdate = false;
        }
    }

    update(): void {
        super.update();

        this._updateBBox();

        // reset clicked variable - should only be true for 1 frame
        if (this._clicked) this._clicked = false;

        // check if mouse is hovering over button
        let mouse = getMouse(true);
        this._hovered = !this.ignore && basicPointInRect(...mouse, this._bx, this._by, this._bw, this._bh);

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
        this._updateBBox();

        let color = grey(lerp(this._hoverTransition, 1, 0.75));

        if (this.invert) {
            color = grey(lerp(this._hoverTransition, 0.05, 0.15));
        }

        ctx.textBaseline = "top";

        d.roundRect(
            this._bx,
            this._by,
            this._bw,
            this._bh,
            this.round == "capsule" ? Math.min(this._bw, this._bh) / 2 : this.round,
            color,
        );

        d.text(
            this._bx + this.padding,
            this._by + this.padding,
            this.text,
            this.invert ? "white" : "black",
            this.font,
            "left",
        );
    }
}
