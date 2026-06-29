import { ctx, font, h } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { NULLTEXTURE } from "../../../lib/ui/hcimage";
import { COLOR } from "../../color";
import { currentGame } from "../../game";
import { CAHPlayer } from "../../types";

const Round = 30;
const Width = 500;

const Padding = 30;
const TitleFontSize = 65;

const PlayerWidth = Width - Padding * 2;
const PlayerHeight = 130;
const PlayerPadding = 20;
const PlayerAvatarSize = PlayerHeight - PlayerPadding * 2;
const PlayerRound = 10;
const PlayerGap = 10;

export class CAHInGamePlayerList extends GameObject {
    private _path: Path2D;
    private _element: ImageBitmap | null;
    private _images: ImageBitmap[] = [];

    constructor() {
        super();

        this._path = this._createPath();
        this._element = null;
    }

    private _render(): ImageBitmap {
        // create le canvas
        const canvas = new OffscreenCanvas(Width, h);
        const ctx = canvas.getContext("2d");

        // throw the shit
        if (!ctx) throw new Error("fuck off!");

        // draw the ui element
        ctx.fillStyle = COLOR.elementFill;
        ctx.fill(this._path);

        // text

        const textX = Width / 2;
        const textY = Padding + TitleFontSize;
        ctx.font = font(TitleFontSize, "bold");
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "white";
        ctx.fillText("Players", textX, textY, Width);

        return canvas.transferToImageBitmap();
    }

    private _crown(): Path2D {
        // crown constants
        const BaseWidth = 30;
        const OuterSpikeX = 18;
        const OuterSpikeY = 20;
        const InnerSpikeX = 8;
        const InnerSpikeY = 15;
        const TopSpikeY = 30;
        const SpikeBallRad = 4;
        const ControlPointOffset = 10;

        const p = new Path2D();

        // first point
        p.moveTo(-BaseWidth / 2, 0);
        p.lineTo(-OuterSpikeX, -OuterSpikeY);
        p.arc(-OuterSpikeX, -OuterSpikeY, SpikeBallRad, 0, Math.PI * 2);
        p.lineTo(-OuterSpikeX, -OuterSpikeY);

        // middle point
        p.lineTo(-InnerSpikeX, -InnerSpikeY);
        p.lineTo(0, -TopSpikeY);
        p.arc(0, -TopSpikeY, SpikeBallRad, 0, Math.PI * 2);
        p.lineTo(0, -TopSpikeY);

        // last point
        p.lineTo(InnerSpikeX, -InnerSpikeY);
        p.lineTo(OuterSpikeX, -OuterSpikeY);
        p.arc(OuterSpikeX, -OuterSpikeY, SpikeBallRad, 0, Math.PI * 2);
        p.lineTo(OuterSpikeX, -OuterSpikeY);

        // come back to the bottom
        p.lineTo(BaseWidth / 2, 0);

        // draw the base
        p.quadraticCurveTo(0, ControlPointOffset, -BaseWidth / 2, 0);

        p.closePath();

        return p;
    }

    private _renderPlayer(ply: CAHPlayer): ImageBitmap {
        // setup canvas
        const canvas = new OffscreenCanvas(PlayerWidth, PlayerHeight);
        const ctx = canvas.getContext("2d");

        const [w, h] = [PlayerWidth, PlayerHeight];

        if (!ctx) throw new Error(":3");

        // background
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, PlayerRound);
        ctx.fillStyle = "#131313d0";
        ctx.fill();

        // avatar
        const avatarMask = new Path2D();
        avatarMask.moveTo(PlayerPadding + PlayerAvatarSize, h / 2);
        avatarMask.arc(PlayerPadding + PlayerAvatarSize / 2, h / 2, PlayerAvatarSize / 2, 0, Math.PI * 2);
        avatarMask.closePath();

        ctx.save();
        ctx.clip(avatarMask);
        ctx.drawImage(NULLTEXTURE, PlayerPadding, (h - PlayerAvatarSize) / 2, PlayerAvatarSize, PlayerAvatarSize); // TODO: add avatars
        ctx.restore();

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke(avatarMask);

        // name
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = font(28);
        ctx.fillStyle = "#fff";
        ctx.fillText(
            ply.name,
            PlayerPadding + PlayerAvatarSize + 10,
            h / 2,
            w - (PlayerPadding * 2 + PlayerAvatarSize + 10),
        );

        if (ply.isHost) {
            // draw le crown
            const c = this._crown();

            // funny angle thing
            const theta = Math.PI * 1.7;
            const shrink = 0.9;
            const offsetX = ((Math.cos(theta) * PlayerAvatarSize) / 2) * shrink;
            const offsetY = ((Math.sin(theta) * PlayerAvatarSize) / 2) * shrink;

            ctx.save();
            ctx.translate(PlayerPadding + PlayerAvatarSize / 2 + offsetX, h / 2 + offsetY);
            ctx.rotate(theta + Math.PI / 2);
            ctx.scale(shrink, shrink);
            ctx.fillStyle = "#ffc037";
            ctx.fill(c);
            ctx.restore();
        }

        return canvas.transferToImageBitmap();
    }

    private _createPath() {
        const p = new Path2D();
        p.moveTo(-Round, 0);
        p.lineTo(Width - Round, 0);
        p.arc(Width - Round, Round, Round, -Math.PI / 2, 0);
        p.lineTo(Width, h - Round);
        p.arc(Width - Round, h - Round, Round, 0, Math.PI / 2);
        p.lineTo(-Round, h);
        p.closePath();
        return p;
    }

    reloadPlayers() {
        this._images = [];
        for (const [_, ply] of currentGame.players) {
            this._images.push(this._renderPlayer(ply));
        }
    }

    draw() {
        if (!this._element) return;

        ctx.drawImage(this._element, 0, 0);

        ctx.save();
        ctx.translate(Padding, Padding + TitleFontSize + Padding);
        for (const img of this._images) {
            ctx.drawImage(img, 0, 0);
            ctx.translate(0, img.height + PlayerGap);
        }
        ctx.restore();
    }

    init() {
        this._element = this._render();

        this.reloadPlayers();
    }
}
