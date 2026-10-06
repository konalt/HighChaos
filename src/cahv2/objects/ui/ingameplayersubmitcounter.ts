import { easeInOutCirc, easeInQuad, easeOutQuad } from "../../../lib/engine/ease";
import { ctx, font, globalTimer, timer } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { createOffscreenCanvas, lerp } from "../../../lib/engine/utils";
import { currentGame } from "../../game";
import { CAHInGameBaseScene } from "../../scenes/ingamebase";
import { CAHPlayer } from "../../types";

const Radius = 190;

export class CAHInGamePlayerSubmitCounter extends GameObject {
    private _octagon: ImageBitmap;
    private _subtitleText: ImageBitmap;

    private _currentPlayers = 0;
    private _totalPlayers = 1;

    scale = 1;
    overrideText: string | null = null;

    constructor(text: string) {
        super();

        this._octagon = this._createOctagon();
        this._subtitleText = this._createSubtitleText(text);

        this.show(1);
    }

    draw() {
        if (!(this.scene instanceof CAHInGameBaseScene)) return;

        const showHideFactor = this._showing
            ? this.objTimer("showhidetoggle", true)
            : 1 - this.objTimer("showhidetoggle", true);

        if (showHideFactor == 0) return;

        // move to where we wanna be
        ctx.save();
        ctx.translate(this.x, this.y);

        // transition the alpha.
        ctx.globalAlpha = this.scene.tlerp(0, 1, 0, false) * showHideFactor;

        // scale transition
        const globalScale = this.scene.tlerp(0, 1, 0) * this.scale * easeOutQuad(showHideFactor);
        ctx.scale(globalScale, globalScale);

        // rotate the octagon
        ctx.save();
        ctx.rotate(globalTimer * 0.001);

        // draw octagon (centered) and then remove the rotation
        ctx.drawImage(this._octagon, -this._octagon.width / 2, -this._octagon.height / 2);
        ctx.restore();

        // draw subtitle
        ctx.drawImage(this._subtitleText, -this._subtitleText.width / 2, -this._subtitleText.height / 2 + 55);

        // cool scaling
        const maxScale = 1.5;
        let scale = 1;
        if (this.objTimer("countchange") < 0.1) {
            scale = lerp(easeInOutCirc(this.objTimer("countchange") / 0.1), 1, maxScale);
        } else {
            scale = lerp(easeInOutCirc((this.objTimer("countchange") - 0.1) / 0.9), maxScale, 1);
        }
        ctx.translate(0, -20);
        ctx.scale(scale, scale);

        // draw the numbers (the interesting part)
        ctx.font = font(120, "900");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.fillText(this.overrideText ?? `${this._currentPlayers}/${this._totalPlayers}`, 0, 0);

        ctx.restore();
    }

    updateCurrentPlayers(
        predicate: (p: CAHPlayer) => boolean = (p) => {
            return false;
        },
    ) {
        if (!currentGame) throw new Error("tried to update player counter without a game");

        this.updateTotalPlayers();

        // store old one for comparison
        const old = this._currentPlayers;

        // count them
        let count = 0;
        for (const [_, ply] of currentGame.players) {
            if (predicate(ply)) {
                count++;
            }
        }
        this._currentPlayers = count;

        // do a timer if the count has changed
        if (old != count) {
            this.objStartTimer("countchange", 200);
        }
    }

    updateTotalPlayers() {
        if (!currentGame) throw new Error("tried to update player counter without a game");

        // store it lol
        this._totalPlayers = currentGame.players.size;
    }

    //#region rendering
    private _createOctagon() {
        const [c, ctx] = createOffscreenCanvas(Radius * 2);

        const points = 8; // 8 points to an octagon
        const increment = (Math.PI * 2) / points; // angle
        let theta = 0;

        ctx.translate(Radius, Radius); // move to center to make the maths easier

        // draw the shape
        ctx.moveTo(Radius, 0);
        for (let i = 0; i < points; i++) {
            ctx.lineTo(Math.cos(theta) * Radius, Math.sin(theta) * Radius);
            theta += increment;
        }
        ctx.closePath();

        // fill it up
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        return c.transferToImageBitmap();
    }

    private _createSubtitleText(text: string) {
        const [c, ctx] = createOffscreenCanvas(Radius * 2, 100);

        // setup
        ctx.font = font(30, "bold");
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";

        // draw it
        ctx.fillText(text, c.width / 2, c.height / 2);

        return c.transferToImageBitmap();
    }
    //#endregion

    //#region showing/hiding
    private _showing = true;

    show(transition = 200) {
        this._showing = true;
        this.objStartTimer("showhidetoggle", transition);
    }

    hide(transition = 200) {
        this._showing = false;
        this.objStartTimer("showhidetoggle", transition);
    }
    //#endregion
}
