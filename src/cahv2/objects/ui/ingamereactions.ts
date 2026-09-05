import { easeInOutBack, easeInOutQuad, easeOutQuad } from "../../../lib/engine/ease";
import {
    consumeMouse,
    ctx,
    CursorMode,
    d,
    deltaTime,
    font,
    getKeyDown,
    getMouse,
    setCursorMode,
    startTimer,
    timer,
} from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { playSound } from "../../../lib/engine/sound";
import {
    basicPointInRect,
    clamp,
    createOffscreenCanvas,
    FourNums,
    grey,
    lerp,
    TwoNums,
} from "../../../lib/engine/utils";
import { NULLTEXTURE } from "../../../lib/ui/hcimage";
import { socket } from "../../network";
import { currentUsername } from "../../profile";
import { Reaction, REACTION_IMAGES } from "../../reactions";
import { generateEmptyAvatar } from "../../utils";

const emojiSize = 95;
const round = 15;

const reactionsOrder: Reaction[] = [
    Reaction.Joy,
    Reaction.XD,
    Reaction.MiddleFinger,
    Reaction.ThumbsUp,
    Reaction.Sob,
    Reaction.Neutral,
    Reaction.Teto,
    Reaction.ThumbsDown,
];

export class CAHInGameReactions extends GameObject {
    clipXStart = 0;
    clipXEnd = 0;

    readonly width: number;
    readonly height: number;

    private _clippedWidth = 0;

    constructor(width: number, height: number) {
        super();

        this.width = width;
        this.height = height;

        this._background = this._renderBackground();
        this._submitter = this._renderSubmitter();

        this._calculateEmojiLocations();
    }

    //#region username stuff
    private _username: string = "username";

    set username(s: string) {
        this._username = s;

        this._submitter = this._renderSubmitter();
    }

    get username() {
        return this._username;
    }
    //#endregion

    private _clip() {
        ctx.beginPath();
        ctx.rect(this.clipXStart, 0, this._clippedWidth, this.height);
        ctx.clip();
    }

    draw() {
        // fully clipped - we do not care
        if (this._clippedWidth < 1) return;

        // setup
        ctx.save();
        ctx.translate(this.x, this.y);

        // clip it if we need to
        if (this._clippedWidth < this.width) {
            this._clip();
        }

        ctx.drawImage(this._background, 0, 0);
        ctx.drawImage(this._submitter, 0, 0);

        this._drawEmojis();

        this._drawProgressBar();

        ctx.restore();
    }

    update() {
        // update clipped width
        this._clippedWidth = this.clipXEnd - this.clipXStart;

        // clamp that shi
        this.clipXStart = clamp(this.clipXStart, 0, this.width);
        this.clipXEnd = clamp(this.clipXEnd, 0, this.width);

        this._updateEmojis();
    }

    //#region progress bar
    startProgressBar(duration = 1000) {
        this.objStartTimer("progressbar", duration, true);
    }

    private _drawProgressBar() {
        const progressBarWidth = this.width * this.objTimer("progressbar", true);
        const progressBarHeight = 5;

        // clip to the rounded rectangle
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, this.width, this.height, round);
        ctx.clip();

        // draw the bar
        ctx.fillStyle = "white";
        ctx.fillRect(0, this.height - progressBarHeight, progressBarWidth, progressBarHeight);

        ctx.restore();
    }
    //#endregion

    //#region emojis
    private _emojiLocations: [number, number][] = new Array(reactionsOrder.length).fill([0, 0]);
    private _emojiHovers: number[] = new Array(reactionsOrder.length).fill(0);
    private _emojisEnabled = true;
    private _emojiScale = 1; // updated by disable anim

    private _calculateEmojiLocations() {
        // empty it out
        this._emojiLocations = [];

        // the margins (x is the same on both sides)
        const marginX = 40 + emojiSize / 2;
        const marginYTop = 20 + emojiSize / 2 + 60; // 20 for top margin, 55 for the text
        const marginYBottom = 25 + emojiSize / 2; // 25 for the bottom margin

        const emojiSpanX = this.width - marginX * 2;
        const emojiSpanY = this.height - marginYBottom - marginYTop;

        for (let y = 0; y < 2; y++) {
            // 2 rows
            for (let x = 0; x < 4; x++) {
                // 4 cols
                const emojiX = marginX + (emojiSpanX / 3) * x;
                const emojiY = marginYTop + emojiSpanY * y;

                this._emojiLocations.push([emojiX, emojiY]);
            }
        }
    }

    private _updateEmojis() {
        // skip update if we can
        if (this._clippedWidth < 1) return;

        // disable effect
        if (!this._emojisEnabled) {
            this._emojiScale = lerp(easeOutQuad(this.objTimer("emojis_disable")), 1, 0.8);
        }

        // get the mouse (and transform it)
        const mouse = getMouse();
        const translatedMouse = [mouse[0] - this.x, mouse[1] - this.y] as TwoNums;

        let i = 0;
        for (const l of this._emojiLocations) {
            // skip emojis that are invisible
            if (l[0] > this._clippedWidth) continue;

            const size = emojiSize * (1 + easeInOutQuad(this._emojiHovers[i]) * 0.3) * this._emojiScale;

            // loop thru all locations
            const rect: FourNums = [l[0] - size / 2, l[1] - size / 2, size, size];

            // check if hovered
            if (basicPointInRect(...translatedMouse, ...rect) && this._emojisEnabled) {
                consumeMouse();
                setCursorMode(CursorMode.Click);

                if (getKeyDown("mouse1")) {
                    // clicked
                    this._handleEmojiClick(reactionsOrder[i]);
                }

                this._emojiHovers[i] += 10 * deltaTime;
            } else {
                this._emojiHovers[i] -= 10 * deltaTime;
            }

            // clampmeat
            this._emojiHovers[i] = clamp(this._emojiHovers[i]);

            i++;
        }
    }

    private _drawEmojis() {
        if (!this._emojisEnabled) {
            const t = this.objTimer("emojis_disable");
            ctx.globalAlpha = 1 - t * 0.5;
        }

        let i = 0;
        for (const [x, y] of this._emojiLocations) {
            const hover = this._emojiHovers[i];
            const scale = this._emojiScale * (1 + easeInOutQuad(hover) * 0.3);

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.drawImage(
                REACTION_IMAGES[reactionsOrder[i]] ?? NULLTEXTURE,
                -emojiSize / 2,
                -emojiSize / 2,
                emojiSize,
                emojiSize,
            );
            ctx.restore();
            i++;
        }
    }

    disableEmojis() {
        this.objStartTimer("emojis_disable", 150);
        this._emojisEnabled = false;
    }

    private _handleEmojiClick(index: number) {
        playSound("ui/pop", 0.3);

        // send reaction to server
        if (socket) {
            socket.emit("reaction", index);
        }

        this.disableEmojis();
    }
    //#endregion

    //#region rendering
    private _background: ImageBitmap;
    private _renderBackground() {
        const [c, ctx] = createOffscreenCanvas(this.width, this.height);

        ctx.fillStyle = "rgba(0,0,0,0.5)";

        ctx.beginPath();
        ctx.roundRect(0, 0, this.width, this.height, round);
        ctx.fill();

        return c.transferToImageBitmap();
    }

    private _submitter: ImageBitmap;
    private _renderSubmitter() {
        const [c, ctx] = createOffscreenCanvas(this.width, this.height);

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = font(30, "400");

        let currentX = 13;
        let currentY = 32;

        const text = "Submitted by ";
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, currentX, currentY);

        currentX += textWidth;

        const avatarSize = 40;

        const avatarMask = new Path2D();
        avatarMask.moveTo(currentX + avatarSize, currentY);
        avatarMask.arc(currentX + avatarSize / 2, currentY, avatarSize / 2, 0, Math.PI * 2);
        avatarMask.closePath();

        ctx.save();
        ctx.clip(avatarMask);
        ctx.drawImage(generateEmptyAvatar(), currentX, currentY - avatarSize / 2, avatarSize, avatarSize); // TODO: add avatars
        ctx.restore();

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke(avatarMask);

        currentX += avatarSize;

        ctx.font = font(30, "600");
        ctx.fillStyle = grey(0.8);
        const username = " " + this._username; // space for avatar spacing
        const usernameWidth = ctx.measureText(username).width;
        ctx.fillText(username, currentX, currentY);
        currentX += usernameWidth;

        return c.transferToImageBitmap();
    }
    //#endregion
}
