import { ctx, font } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { createOffscreenCanvas } from "../../../lib/engine/utils";
import { currentGame } from "../../game";
import { CAHPlayer } from "../../types";
import { circularAvatar } from "../../utils";

const Round = 15;
const Padding = 20;
const AvatarSize = 120;

export class CAHInGameVoteCount extends GameObject {
    readonly width: number;
    readonly height: number;

    constructor(width: number, height: number) {
        super();

        this.width = width;
        this.height = height;

        this._rendered = this._render([]);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.drawImage(this._rendered, 0, 0, this.width, this.height);

        ctx.restore();
    }

    updateContent(voters: string[]) {
        // turn voters list into list of players
        const players: CAHPlayer[] = [];
        for (const v of voters) {
            const ply = currentGame.players.get(v); // get the player
            if (!ply) continue; // if no player continue
            players.push(ply);
        }

        // render it
        this._rendered = this._render(players);
    }

    private _rendered: ImageBitmap;
    private _render(players: CAHPlayer[]) {
        const w = this.width,
            h = this.height;
        const [c, ctx] = createOffscreenCanvas(w, h);

        const voteCount = players.length;

        // background
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, Round);
        ctx.fill();

        // counter
        ctx.fillStyle = "white";
        ctx.font = font(120, "800");
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(voteCount.toString(), w / 2, Padding);

        // subtitle
        ctx.font = font(30, "600");
        ctx.fillText(`vote${voteCount == 1 ? "" : "s"} received`, w / 2, Padding + 115);

        // calculate avatar spacing
        const avSpan = w - Padding * 2 - AvatarSize;
        const avGap = avSpan / (voteCount - 1);

        let cx = Padding;
        for (const ply of players) {
            // circularize the avatar
            const av = circularAvatar(ply.avatar, AvatarSize);

            // draw it
            ctx.drawImage(av, cx, h - Padding - AvatarSize, AvatarSize, AvatarSize);
            cx += avGap;
        }

        return c.transferToImageBitmap();
    }
}
