import { easeInOutBack, easeOutQuad } from "../../../lib/engine/ease";
import { ctx, d, font, globalTimer, h, since, timer, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { playSound } from "../../../lib/engine/sound";
import { clamp, lerp } from "../../../lib/engine/utils";
import { CAHInGameBaseScene } from "../../scenes/ingamebase";

const MiddleBoxSize = 350;
const MiddleBoxColor = "#4c195c";

export class CAHLobbyCountdown extends GameObject {
    // for events to run every beat
    private _lastFrameSecond = -1;

    draw() {
        // ensure its an ingame scene
        if (!(this.scene instanceof CAHInGameBaseScene)) return;

        // skip drawing if no countdown
        if (!this._isCountingDown) return;

        // fade out alpha - overrides
        const fadeOut = this.scene.tlerp(0, 1, false);

        const t = since(this._start);

        const transition = clamp(t / 200); // 150ms

        // draw the black overlay part
        ctx.globalAlpha = lerp(transition, 0, 0.5) * fadeOut; // fade in
        d.rect(0, 0, w, h, "black");
        ctx.globalAlpha = 1;

        // draw the shape
        ctx.save();
        ctx.translate(w / 2, h * 1.5 - easeOutQuad(transition) * h);
        ctx.rotate(this._getRotation(t));

        const scale = this.scene.tlerp(0, 1, true);
        ctx.scale(scale, scale);

        ctx.globalAlpha = fadeOut;

        d.rect(-MiddleBoxSize / 2, -MiddleBoxSize / 2, MiddleBoxSize, MiddleBoxSize, MiddleBoxColor);

        ctx.restore();

        // draw the current countdown number
        const remaining = this._duration - t;

        // calculate alpha
        const alpha = clamp(((remaining / 1000) % 1) * 2);

        ctx.globalAlpha = alpha * fadeOut;
        ctx.textBaseline = "middle";
        d.text(
            w / 2,
            h * 1.5 - easeOutQuad(transition) * h,
            Math.ceil(remaining / 1000).toString(),
            "white",
            font(MiddleBoxSize * 0.45, "900"),
            "center",
        );
        ctx.globalAlpha = 1;
    }

    update() {
        // ensure its an ingame scene
        if (!(this.scene instanceof CAHInGameBaseScene)) return;

        // skip update if no countdown
        if (!this._isCountingDown) return;

        const t = since(this._start);
        const remaining = this._duration - t;

        if (Math.ceil(remaining / 1000) != this._lastFrameSecond) {
            this.onBeat();
            this._lastFrameSecond = Math.ceil(remaining / 1000);
        }
    }

    onBeat() {
        playSound("ui/countdown_tick", 0.7);
    }

    private _getRotation(t: number) {
        const mod = (t / 1000) % 1; // reset every second
        return (easeOutQuad(clamp(mod * 2)) * Math.PI) / 2 + Math.PI / 4;
    }

    //#region countdown management
    private _duration = 0;
    private _start = 0;
    private _isCountingDown = false;

    startCountdown(duration = 3000) {
        this._isCountingDown = true;
        this._duration = duration;
        this._start = globalTimer;
        this.objStartTimer("countdown", duration);

        playSound("ui/skinslide");
    }
    //#endregion
}
