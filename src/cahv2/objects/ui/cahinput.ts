import {
    cancelTyping,
    CanvasStyle,
    ctx,
    CursorMode,
    d,
    finishTyping,
    getKeyDown,
    getMouse,
    getTyping,
    getTypingCursor,
    getTypingCursorFlashTime,
    getTypingText,
    onTypingCancel,
    onTypingFinish,
    onTypingType,
    setCursorMode,
    since,
    startTyping,
    TYPING_CURSOR_FLASH_INTERVAL,
} from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { Anchor, anchorToCoords, basicPointInRect } from "../../../lib/engine/utils";
import { COLOR } from "../../color";

export class CAHTextInput extends GameObject {
    private _id = "hcinput" + Math.random() * 2 ** 8;
    // Hover storage
    private _hovered = false;
    private _typing = false;
    private _cursor = 0;
    private _cursorFlashTime = 0;
    private _cursorVisible = false;

    // Bounding box
    private _bx = 0;
    private _by = 0;
    private _bw = 0;
    private _bh = 0;

    anchor: Anchor = "cc";

    textWidth = 250;
    padding = 20;
    round = 10;
    strokeWidth = 2;
    backgroundColor: CanvasStyle = COLOR.elementFill;
    strokeColor: CanvasStyle = COLOR.elementStroke;
    textColor: CanvasStyle = "#fff";
    placeholderColor: CanvasStyle = "#a8a8a8";

    font = "32px sans-serif";

    value = "";
    placeholder = "Text...";
    clearOnStartTyping = false;
    ignore = false;

    needsUpdate = true;

    // Events
    onFocus: () => void = () => {};
    onUnfocus: () => void = () => {};
    onFinish: () => void = () => {};
    onTextUpdate: (text: string) => string | boolean = () => {
        return true;
    };

    constructor() {
        super();
    }

    private _updateBBox() {
        if (this.needsUpdate) {
            this._bw = this.textWidth + this.padding * 2;

            let measure = ctx.measureText("My");
            this._bh = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + this.padding * 2;

            let [bx, by] = anchorToCoords(this.anchor, this.x, this.y, this._bw, this._bh);
            this._bx = bx;
            this._by = by;

            this.needsUpdate = false;
        }
    }

    update(): void {
        super.update();

        ctx.textBaseline = "top";
        ctx.font = this.font;

        this._updateBBox();

        // check if mouse is hovering over input
        let mouse = getMouse(true);
        this._hovered = !this.ignore && basicPointInRect(...mouse, this._bx, this._by, this._bw, this._bh);

        if (this._hovered) {
            setCursorMode(CursorMode.Text);
            if (getKeyDown("mouse1")) {
                this.focus();
            }
        }

        this._typing = getTyping(this._id);
        if (this._typing) {
            this._cursor = getTypingCursor(this._id);
            this._cursorFlashTime = getTypingCursorFlashTime();
            this._cursorVisible =
                since(getTypingCursorFlashTime()) % TYPING_CURSOR_FLASH_INTERVAL < TYPING_CURSOR_FLASH_INTERVAL / 2;
            this.value = getTypingText(this._id);

            if (getKeyDown("mouse1") && !this._hovered) {
                this.unfocus();
            }
        }
    }

    draw() {
        ctx.textBaseline = "top";
        ctx.font = this.font;

        this._updateBBox();

        d.roundRect(
            this._bx,
            this._by,
            this._bw,
            this._bh,
            this.round,
            this.backgroundColor,
            this.strokeColor,
            this.strokeWidth,
        );

        let text = this.value;
        let color = this.textColor;
        if (this.value.length == 0 && !this._typing) {
            text = this.placeholder;
            color = this.placeholderColor;
        }

        d.text(
            this._bx + this.padding + this.textWidth / 2,
            this._by + this.padding,
            text,
            color,
            this.font,
            "center",
            this.textWidth,
        );

        if (this._typing) {
            let cx =
                this._bx +
                this.padding +
                ctx.measureText(text.substring(0, this._cursor)).width / 2 +
                this.textWidth / 2;
            cx += 1;
            ctx.beginPath();
            ctx.moveTo(cx, this._by + this.padding);
            ctx.lineTo(cx, this._by + this._bh - this.padding);
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.textColor;
            ctx.stroke();
        }
    }

    focus() {
        onTypingCancel(this._id, () => {
            this.onUnfocus();
        });
        onTypingFinish(this._id, () => {
            this.onUnfocus();
        });
        onTypingType(this._id, (text: string) => {
            ctx.font = this.font;
            let w = ctx.measureText(text).width;
            if (w > this.textWidth) return false;
            return this.onTextUpdate(text);
        });
        startTyping(this._id, this.clearOnStartTyping);
        this.onFocus();
    }

    unfocus() {
        cancelTyping(this._id);
        this.onUnfocus();
    }

    finish() {
        finishTyping(this._id);
        this.onFinish();
    }
}
