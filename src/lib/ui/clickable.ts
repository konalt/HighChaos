import { ctx, CursorMode, d, getKeyDown, getMouse, setCursorMode } from "../engine/engine";
import { GameObject } from "../engine/object";
import { Anchor, anchorToCoords, basicPointInRect, clamp, FourNums, grey, lerp } from "../engine/utils";

export class Clickable extends GameObject {
    // Hover storage
    private _hovered = false;
    private _hoverTransition = 0;
    private _clicked = false;

    // Bounding box
    bx = 0;
    by = 0;
    bw = 0;
    bh = 0;

    // Properties
    hoverAnimationSpeed = 0.3;
    onClick: () => void;
    ignore = false;

    // Yeah
    needsUpdate = true;

    constructor() {
        super();

        this.onClick = () => {};
    }

    update(): void {
        // reset clicked variable - should only be true for 1 frame
        if (this._clicked) this._clicked = false;

        // check if mouse is hovering
        let mouse = getMouse(true);
        this._hovered = !this.ignore && basicPointInRect(...mouse, this.bx, this.by, this.bw, this.bh);

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
        this.drawBoundingBox();

        d.circ(...getMouse(true), 3, "red");
    }

    drawBoundingBox() {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.bx, this.by, this.bw, this.bh);
    }

    setBoundingBox(box: FourNums) {
        this.bx = box[0];
        this.by = box[1];
        this.bw = box[2];
        this.bh = box[3];
    }

    getBoundingBox() {
        return [this.bx, this.by, this.bw, this.bh];
    }

    get hoverTransition() {
        return this._hoverTransition;
    }

    get hovered() {
        return this._hovered;
    }
}
