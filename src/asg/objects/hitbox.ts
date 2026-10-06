import { ctx, deltaTime, loadImage } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { alpha, clamp } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { ASGInGameScene } from "../scenes/ingame";
import { PLAYER_HITBOX_RAD } from "../config";

const FADE_SPEED = 20;

export class ASGHitbox extends GameObject {
    private _img = NULLTEXTURE;
    private _alpha = 0;

    update() {
        // we only support ingame scene
        if (!(this.scene instanceof ASGInGameScene)) return;

        // always follow player
        this.x = this.scene.player.x;
        this.y = this.scene.player.y;

        // alpha shit
        if (this.scene.player.focus) {
            this._alpha += FADE_SPEED * deltaTime;
        } else {
            this._alpha -= FADE_SPEED * deltaTime;
        }

        this._alpha = clamp(this._alpha);
    }

    draw() {
        // set alpha if its above 0 otherwise dont draw
        if (!alpha(this._alpha)) return;

        // draw image
        ctx.drawImage(
            this._img,
            this.x - PLAYER_HITBOX_RAD,
            this.y - PLAYER_HITBOX_RAD,
            PLAYER_HITBOX_RAD * 2,
            PLAYER_HITBOX_RAD * 2,
        );

        // reset da alpha
        ctx.globalAlpha = 1;
    }

    async load() {
        this._img = await loadImage("asg/pa_hitbox.png");
    }
}
