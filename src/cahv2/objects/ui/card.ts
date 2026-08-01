import { easeOutQuad } from "../../../lib/engine/ease";
import {
    canvas,
    ctx,
    CursorMode,
    d,
    debugMode,
    deltaTime,
    font,
    getKeyDown,
    getMouse,
    loadImage,
    removeTimer,
    setCursorMode,
    startTimer,
    timer,
    timerEnd,
    useCanvas,
    wrap,
} from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { basicPointInRect, clamp } from "../../../lib/engine/utils";
import { COLOR } from "../../color";

const CardWidth = 330;
const CardHeight = 450;
const CardRadius = 10;
const CardMargin = 20;
const CardOutline = 5;
const CardFontSize = 30;
const CardBackFontSize = 56;
const CardFontWeight = 700;
const CardBackFontWeight = 800;
const CardFlipDuration = 300;

export class CAHCard extends GameObject {
    // le cache
    private cache: ImageBitmap | null = null;

    // hovering stuff
    private _hovered = false;
    private _hoverTransition = 0;
    private _clicked = false;
    hoverAnimationSpeed = 20;

    // clicking stuff
    clickable = true;
    onClick: () => void = () => {};

    // things that would require updates / rerenders
    private _isWhite = false;
    private _text = "";
    private _forceBigText = false;

    // bounding box
    private _bx = 0;
    private _by = 0;
    private _bw = 0;
    private _bh = 0;

    // oh flip! math!
    private _flip = 0;
    private _isFlipping = false;
    private _flipOrigin = 0;
    private _flipScaleFactor = 0;

    // scaling
    private _scale = 1; // final scale w/ everything taken into account
    hoverScaleAmount = 0.05; // how much to change da scale when hovered
    scale = 1; // global scale to modify

    constructor() {
        super();
    }

    static renderCard(text: string, isWhite: boolean, forceBigText = false) {
        // get a canvas
        const canvas = new OffscreenCanvas(CardWidth + 10, CardHeight + 10);
        const ctx = canvas.getContext("2d");

        // hahaha! you may be using a browser from the stone age!
        if (!ctx) throw new Error("unable to get offscreen context");

        // set up colors
        let backgroundColor = isWhite ? COLOR.cardWhite : COLOR.cardBlack;
        let textColor = isWhite ? COLOR.cardBlack : COLOR.cardWhite;

        // backshots
        let isBack = text == "_back_";
        if (isBack) text = "Cards\nAgainst\nHumanity";

        // canvas setup
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = backgroundColor;
        ctx.strokeStyle = textColor;
        ctx.lineWidth = CardOutline;

        // draw card shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.roundRect(-CardWidth / 2, -CardHeight / 2, CardWidth, CardHeight, CardRadius);
        ctx.fill();
        ctx.stroke();

        // text setup
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        if (isBack || forceBigText) {
            ctx.font = font(CardBackFontSize, CardBackFontWeight.toString());
        } else {
            ctx.font = font(CardFontSize, CardFontWeight.toString());
        }
        ctx.fillStyle = textColor;

        // wrap the text
        let lines = wrap(text, CardWidth - CardMargin * 2, ctx.font);

        // calculate line height
        let lineheight = parseFloat(ctx.font.split(" ").find((p) => p.includes("px")) ?? "12") * 1.05;

        // draw the text
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(
                lines[i],
                -CardWidth / 2 + CardMargin,
                -CardHeight / 2 + CardMargin + i * lineheight,
                CardWidth - CardMargin * 2,
            );
        }

        // Cleanup
        ctx.restore();

        return canvas.transferToImageBitmap();
    }

    async createCache() {
        this.cache = CAHCard.renderCard(this._text, this._isWhite, this._forceBigText);
    }

    private recalculateFlipShit() {
        // fix flipping if it needs to be
        if (this._flip >= 2) {
            this._flip %= 2;
        }

        // calculate flip scale factor
        this._flipScaleFactor = Math.abs(Math.cos(this._flip * Math.PI));
    }

    private recalculateBoundingBox() {
        // calculate bounding box
        this._bw = CardWidth * this._scale * this._flipScaleFactor;
        this._bh = CardHeight * this._scale;
        this._bx = this.x - this._bw / 2;
        this._by = this.y - this._bh / 2;
    }

    update() {
        // flip timers
        if (this._isFlipping) {
            this._flip = this._flipOrigin + timer(`flip${this.uuid}`, true);
        }

        // for when the flipping ends
        timerEnd(`flip${this.uuid}`, () => {
            this._isFlipping = false;
        });

        this.recalculateFlipShit();

        this.recalculateBoundingBox();

        // mouse shit
        // reset clicked variable - should only be true for 1 frame
        if (this._clicked) this._clicked = false;

        // check if mouse is hovering over button
        let mouse = getMouse(true);
        this._hovered = this.clickable && basicPointInRect(...mouse, this._bx, this._by, this._bw, this._bh);

        if (this._hovered) {
            // hovering - advance hover animation
            this._hoverTransition += this.hoverAnimationSpeed * deltaTime;

            // set the cursor mode
            setCursorMode(CursorMode.Click);

            // handle clicking
            if (getKeyDown("mouse1")) {
                this.onClick();
                this._clicked = true;
            }
        } else {
            // not hovered - reverse hover anim
            this._hoverTransition -= this.hoverAnimationSpeed * deltaTime;
        }

        // clamp that shit
        this._hoverTransition = clamp(this._hoverTransition);

        // apply a scaling thing
        this._scale = this.scale * (1 + this._hoverTransition * this.hoverScaleAmount);
    }

    draw() {
        // setup
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this._scale * this._flipScaleFactor, this._scale);

        // safety - if there is no cached image, draw a scary rectangle instead
        if (this.cache) {
            // default to the cached image (the card)
            let img = this.cache;

            // if the card is flipped, replace it with the back image
            if (this._flip > 0.5 && this._flip < 1.5) {
                // depends on the color!
                if (this.isWhite) {
                    img = CardBackWhite;
                } else {
                    img = CardBackBlack;
                }
            }
            ctx.drawImage(img, -this.cache.width / 2, -this.cache.height / 2);
        } else {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(-CardWidth / 2, -CardHeight / 2, CardWidth, CardHeight);
        }

        // return to normalcy
        ctx.restore();

        // debug
        if (debugMode) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(this._bx, this._by, this._bw, this._bh);
        }
    }

    flip(duration = CardFlipDuration) {
        // if already flipping, ignore
        if (this._isFlipping) return;

        this._isFlipping = true;
        this._flipOrigin = Math.floor(this._flip);

        startTimer(`flip${this.uuid}`, duration);
    }

    flipFaceDown(duration = CardFlipDuration) {
        if (Math.floor(this._flip) == 1) return;

        this.flip(duration);
    }

    flipFaceUp(duration = CardFlipDuration) {
        if (Math.floor(this._flip) == 0) return;

        this.flip(duration);
    }

    setFlip(value: number) {
        removeTimer(`flip${this.uuid}`);
        this._isFlipping = false;
        this._flip = value;

        this.recalculateFlipShit();
    }

    //#region getters n setters
    get text() {
        return this._text;
    }

    set text(text: string) {
        this._text = text;
        this.createCache();
    }

    get isWhite() {
        return this._isWhite;
    }

    set isWhite(isWhite: boolean) {
        this._isWhite = isWhite;
        this.createCache();
    }

    get forceBigText() {
        return this._forceBigText;
    }

    set forceBigText(forceBigText: boolean) {
        this._forceBigText = forceBigText;
        this.createCache();
    }
    //#endregion
}

export const CardBackBlack = CAHCard.renderCard("_back_", false);
export const CardBackWhite = CAHCard.renderCard("_back_", true);
