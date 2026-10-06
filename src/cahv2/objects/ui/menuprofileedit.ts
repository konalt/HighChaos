import { easeOutCirc } from "../../../lib/engine/ease";
import {
    acceptFile,
    consumeMouse,
    ctx,
    CursorMode,
    font,
    getKeyDown,
    getMouse,
    h,
    loadImageAbsolute,
    setCursorMode,
    w,
} from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { basicPointInRect, createOffscreenCanvas, FourNums } from "../../../lib/engine/utils";
import { cropAvatar, currentAvatar, currentUsername, setAvatar, setUsername } from "../../profile";
import { CAHMainMenuScene } from "../../scenes/mainmenu";
import { circularAvatar, generateEmptyAvatar } from "../../utils";

const Width = 750;
const Height = 340;
const Padding = 20;
const AvatarSize = 150;
const ContentStart = 120;

export class CAHMenuProfileEdit extends GameObject {
    constructor() {
        super();

        this._background = this._renderBackground();
        this._avatar = circularAvatar(currentAvatar);
    }

    private _usernameBoundingBox: FourNums = [0, 0, 0, 0];
    private _usernameHover = false;

    draw() {
        if (!this._isShowing) return;

        const t = this._isHiding ? 1 - easeOutCirc(this.objTimer("hide")) : easeOutCirc(this.objTimer("show"));

        ctx.save();

        // the background
        ctx.globalAlpha = t * 0.7;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;

        ctx.translate((w - Width) / 2, (h - Height) / 2 + (1 - t) * h);
        ctx.drawImage(this._background, 0, 0, Width, Height);

        // avatar
        ctx.drawImage(this._avatar, Padding, ContentStart, AvatarSize, AvatarSize);

        // username
        ctx.fillStyle = "#ddd";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = font(AvatarSize * 0.4, "500");
        ctx.fillText(
            currentUsername,
            Padding + AvatarSize + 10,
            ContentStart + AvatarSize / 2,
            Width - (Padding * 2 + AvatarSize + 10),
        );

        // username underline
        if (this._usernameHover) {
            ctx.beginPath();
            ctx.moveTo(Padding + AvatarSize + 10, ContentStart + AvatarSize / 2 + 30);
            ctx.lineTo(
                Padding + AvatarSize + 10 + ctx.measureText(currentUsername).width,
                ContentStart + AvatarSize / 2 + 30,
            );
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    }

    update(): void {
        if (!this._isShowing) return;

        this._updateShowHide();

        this._usernameBoundingBox = [
            (w - Width) / 2 + Padding + AvatarSize + 10,
            (h - Height) / 2 + ContentStart + AvatarSize / 2 - 40,
            Width - (Padding * 2 + AvatarSize + 10),
            80,
        ];

        consumeMouse();

        const mouse = getMouse();

        // Avatar
        if (
            basicPointInRect(
                ...mouse,
                (w - Width) / 2 + Padding,
                (h - Height) / 2 + ContentStart,
                AvatarSize,
                AvatarSize,
            )
        ) {
            setCursorMode(CursorMode.Click);
            if (getKeyDown("mouse1")) {
                acceptFile().then(async (url) => {
                    const image = await loadImageAbsolute(url);
                    const cropped = cropAvatar(image);

                    setAvatar(cropped);
                    this._avatar = circularAvatar(currentAvatar);
                    if (this.scene instanceof CAHMainMenuScene) {
                        this.scene.menuProfile.updateAvatar();
                    }
                });
            }
        }

        // Name
        this._usernameHover = basicPointInRect(...mouse, ...this._usernameBoundingBox);
        if (this._usernameHover) {
            setCursorMode(CursorMode.Click);
            if (getKeyDown("mouse1")) {
                const newName = prompt("Enter new username", currentUsername);

                if (newName) {
                    setUsername(newName);
                }
            }
        }

        // Exit by clicking outside of the box
        if (getKeyDown("mouse1") && !basicPointInRect(...mouse, (w - Width) / 2, (h - Height) / 2, Width, Height)) {
            this.hide();
        }
    }

    //#region showing / hiding
    private _isShowing = false;
    private _isHiding = false;

    private _updateShowHide() {
        this.objTimerEnd("hide", () => {
            this._isHiding = false;
            this._isShowing = false;
            this.objRemoveTimer("show");
        });
    }

    show() {
        this._isShowing = true;
        this.objStartTimer("show", 300);
    }

    hide() {
        this._isHiding = true;
        this.objStartTimer("hide", 300);
    }
    //#endregion

    //#region rendering
    private _background: ImageBitmap;
    private _avatar: ImageBitmap;

    private _renderBackground() {
        const [c, ctx] = createOffscreenCanvas(Width, Height);

        // bg
        ctx.fillStyle = "rgb(36, 36, 36)";
        ctx.roundRect(0, 0, Width, Height, 15);
        ctx.fill();

        // title
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = font(80, "bold");
        ctx.fillText("Edit Profile", Width / 2, Padding);

        // underline
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Padding, 80 + Padding);
        ctx.lineTo(Width - Padding, 80 + Padding);
        ctx.stroke();

        // help text
        ctx.textBaseline = "bottom";
        ctx.font = font(20);
        ctx.fillText("Click on the avatar image to upload a new avatar.", Width / 2, Height - Padding);
        ctx.fillText("Click on the username to change it.", Width / 2, Height - Padding - 30);

        return c.transferToImageBitmap();
    }
    //#endregion
}
