import { easeOutCirc, easeOutQuad } from "../../../lib/engine/ease";
import { ctx, font, h, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { createOffscreenCanvas, lerp } from "../../../lib/engine/utils";
import { NULLTEXTURE } from "../../../lib/ui/hcimage";
import { currentGame } from "../../game";
import { CAHPlayer } from "../../types";
import { circularAvatar } from "../../utils";

const bronzePlayerX = 1390;
const silverPlayerX = 490;
const goldPlayerScale = 1.3;
const bounceFactor = 0.5;

const playerWidth = 600;
const playerHeight = 300;

export class CAHInGameFinalPodium extends GameObject {
    private _bronzeY = 0;
    private _silverY = 0;
    private _goldY = 0;

    private _totalBronzeHeight = 0;

    forceAllVisible = false;

    constructor() {
        super();

        this._bronze = this._renderBronze();
        this._silver = this._renderSilver();
        this._gold = this._renderGold();

        if (currentGame) {
            this._players = Array.from(currentGame.players).map((p, i) =>
                this._renderPlayer(p[1], i == 0 ? goldPlayerScale : 1),
            );
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // bronze
        if (this._players[2] || this.forceAllVisible) {
            ctx.drawImage(this._bronze, w / 2 + 50, this._bronzeY);
            ctx.drawImage(
                this._players[2] ?? NULLTEXTURE,
                bronzePlayerX - playerWidth / 2,
                this._bronzeY - playerHeight,
                playerWidth,
                playerHeight,
            );
        }

        // silver
        if (this._players[1] || this.forceAllVisible) {
            ctx.drawImage(this._silver, w / 2 - this._silver.width - 50, this._silverY);
            ctx.drawImage(
                this._players[1] ?? NULLTEXTURE,
                silverPlayerX - playerWidth / 2,
                this._silverY - playerHeight,
                playerWidth,
                playerHeight,
            );
        }

        // gold
        if (this._players[0] || this.forceAllVisible) {
            ctx.drawImage(this._gold, (w - this._gold.width) / 2, this._goldY);
            ctx.drawImage(
                this._players[0] ?? NULLTEXTURE,
                (w - playerWidth * goldPlayerScale) / 2,
                this._goldY - playerHeight * goldPlayerScale,
                playerWidth * goldPlayerScale,
                playerHeight * goldPlayerScale,
            );
        }

        ctx.restore();
    }

    update() {
        if (this._bronzeGoingDown) {
            this._bronzeY = lerp(
                easeOutCirc(this.objTimer("bronze_down")),
                h - this._bronze.height,
                h - this._bronze.height * (1 - bounceFactor),
            );
        } else {
            this._bronzeY = lerp(
                easeOutCirc(this.objTimer("bronze_up")),
                h + this._bronze.height + playerHeight,
                h - this._bronze.height,
            );
        }

        if (this._silverGoingDown) {
            this._silverY = lerp(
                easeOutCirc(this.objTimer("silver_down")),
                h - this._silver.height,
                h - this._silver.height * (1 - bounceFactor),
            );
        } else {
            this._silverY = lerp(
                easeOutCirc(this.objTimer("silver_up")),
                h + this._silver.height + playerHeight,
                h - this._silver.height,
            );
        }

        if (this._goldGoingDown) {
            this._goldY = lerp(
                easeOutCirc(this.objTimer("gold_down")),
                h - this._gold.height,
                h - this._gold.height * (1 - bounceFactor),
            );
        } else {
            this._goldY = lerp(
                easeOutCirc(this.objTimer("gold_up")),
                h + this._gold.height + playerHeight * goldPlayerScale,
                h - this._gold.height,
            );
        }
    }

    setPlayers(top3: CAHPlayer[]) {
        this._players = top3.map((p, i) => this._renderPlayer(p, i == 0 ? goldPlayerScale : 1));
    }

    //#region showing the shit
    private _bronzeGoingDown = false;
    private _silverGoingDown = false;
    private _goldGoingDown = false;

    showBronze() {
        this._bronzeGoingDown = false;
        this.objStartTimer("bronze_up", 500);
    }

    showSilver() {
        this._bronzeGoingDown = true;
        this._silverGoingDown = false;
        this.objStartTimer("bronze_down", 500);
        this.objStartTimer("silver_up", 500);
    }

    showGold() {
        this._silverGoingDown = true;
        this._goldGoingDown = false;
        this.objStartTimer("silver_down", 500);
        this.objStartTimer("gold_up", 500);
    }
    //#endregion

    //#region players
    private _players: ImageBitmap[] = [];

    private _renderPlayer(ply: CAHPlayer, scale = 1) {
        const [w, h] = [Math.floor(playerWidth * scale), Math.floor(playerHeight * scale)];
        const [c, ctx] = createOffscreenCanvas(w, h);

        const avatarSize = 240 * scale;

        // avatar
        ctx.drawImage(circularAvatar(ply.avatar), (w - avatarSize) / 2, 0, avatarSize, avatarSize);

        // username
        ctx.font = font(50 * scale, "bold");
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 6 * scale;
        ctx.strokeText(ply.name, w / 2, h - 10 * scale, w);
        ctx.fillText(ply.name, w / 2, h - 10 * scale, w);

        return c.transferToImageBitmap();
    }
    //#endregion

    //#region the actual podium itself
    private _bronze: ImageBitmap;
    private _renderBronze() {
        const [w, h] = [600, 270];
        const [c, ctx] = createOffscreenCanvas(w, h);

        // gradient
        const grad = ctx.createRadialGradient(w + 20, -20, 0, w + 20, -20, 500);
        grad.addColorStop(0, "#d4a153");
        grad.addColorStop(1, "#834b17");
        ctx.fillStyle = grad;

        // shape
        ctx.beginPath();
        ctx.moveTo(70, 0); // top left
        ctx.lineTo(w, 0); // top right
        ctx.lineTo(w - 110, h); // bottom right
        ctx.lineTo(0, h); // bottom left
        ctx.fill();

        return c.transferToImageBitmap();
    }

    private _silver: ImageBitmap;
    private _renderSilver() {
        const [w, h] = [650, 400];
        const [c, ctx] = createOffscreenCanvas(w, h);

        // gradient
        const grad = ctx.createRadialGradient(w, -20, 0, w, -20, h);
        grad.addColorStop(0, "#d1d1d1");
        grad.addColorStop(1, "#797979");
        ctx.fillStyle = grad;

        // shape
        ctx.beginPath();
        ctx.moveTo(0, 0); // top left
        ctx.lineTo(w - 100, 0); // top right
        ctx.lineTo(w, h); // bottom right
        ctx.lineTo(140, h); // bottom left
        ctx.fill();

        return c.transferToImageBitmap();
    }

    private _gold: ImageBitmap;
    private _renderGold() {
        const [w, h] = [530, 600];
        const [c, ctx] = createOffscreenCanvas(w, h);

        ctx.translate(w / 2, 0);

        // gradient
        const grad = ctx.createRadialGradient(w / 2, -20, 0, w / 2, -20, h);
        grad.addColorStop(0, "#ffeea0");
        grad.addColorStop(1, "#dfa70c");
        ctx.fillStyle = grad;

        const top = w / 2;
        const bottom = 150;

        // shape
        ctx.beginPath();
        ctx.moveTo(-top, 0); // top left
        ctx.lineTo(top, 0); // top right
        ctx.lineTo(bottom, h); // bottom right
        ctx.lineTo(-bottom, h); // bottom left
        ctx.fill();

        return c.transferToImageBitmap();
    }
    //#endregion
}
