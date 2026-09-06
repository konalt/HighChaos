import { addToAtlas, ctx, font } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { lerp } from "../../../lib/engine/utils";
import { Clickable } from "../../../lib/ui/clickable";
import { COLOR } from "../../color";
import { currentAvatar, currentUsername, setUsername } from "../../profile";
import { circularAvatar, generateEmptyAvatar } from "../../utils";

const Width = 400;
const Height = 80;
const Padding = 7.5;
const RoundRadius = 15;
const AvatarRoundRadius = 12;
const AvatarSize = Height - Padding * 2;
const Gap = 10;

export class CAHMenuProfile extends Clickable {
    private _avatarDisplay: ImageBitmap = generateEmptyAvatar();

    constructor() {
        super();

        this._avatarDisplay = circularAvatar(currentAvatar, 128);

        this.bw = Width;
        this.bh = Height;
    }

    update() {
        super.update();

        this.bx = this.x;
        this.by = this.y;
    }

    updateAvatar() {
        this._avatarDisplay = circularAvatar(currentAvatar, 128);
    }

    draw() {
        ctx.fillStyle = COLOR.btnBackground;
        ctx.strokeStyle = COLOR.btnBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, Width, Height, RoundRadius);
        ctx.globalAlpha = lerp(this.hoverTransition, 0.3, 0.75);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();

        ctx.drawImage(this._avatarDisplay, this.x + Padding, this.y + Padding, AvatarSize, AvatarSize);

        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.font = font(AvatarSize / 2);
        ctx.fillText(
            currentUsername,
            this.x + Padding + AvatarSize + Gap,
            this.y + Height / 2 + AvatarSize * 0.2,
            Width - this.x - Padding * 2 - AvatarSize - Gap,
        );
    }
}
