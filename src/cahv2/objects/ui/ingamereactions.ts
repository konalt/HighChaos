import { ctx, font } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { clamp, createOffscreenCanvas, grey } from "../../../lib/engine/utils";
import { NULLTEXTURE } from "../../../lib/ui/hcimage";
import { currentUsername } from "../../profile";
import { generateEmptyAvatar } from "../../utils";

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
    }

    private _username: string = "username";

    set username(s: string) {
        this._username = s;

        this._submitter = this._renderSubmitter();
    }

    get username() {
        return this._username;
    }

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

        ctx.restore();
    }

    update() {
        // update clipped width
        this._clippedWidth = this.clipXEnd - this.clipXStart;

        // clamp that shi
        this.clipXStart = clamp(this.clipXStart, 0, this.width);
        this.clipXEnd = clamp(this.clipXEnd, 0, this.width);
    }

    //#region rendering
    private _background: ImageBitmap;
    private _renderBackground() {
        const [c, ctx] = createOffscreenCanvas(this.width, this.height);

        ctx.fillStyle = "rgba(0,0,0,0.5)";

        ctx.beginPath();
        ctx.roundRect(0, 0, this.width, this.height, 15);
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
