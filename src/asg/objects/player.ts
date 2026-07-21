import { Axis, ctx, deltaTime, getAxis, getKey, getMouse, globalTimer, h, loadImage, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { getAngle } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";

export const PLAYER_SPRITE_SIZE = 50;
export const PLAYER_HITBOX_RAD = 7;

export const PLAYER_SPEED_BASE = 500;
export const PLAYER_SPEED_FOCUS_MULT = 0.46;

const CURSOR_SIZE = 30;

export class ASGPlayer extends GameObject {
    private _ang = 0; // Angle
    private _img = NULLTEXTURE; // image
    private _cur = NULLTEXTURE; // cursor
    private _hb = NULLTEXTURE; // hitbox

    // Where the player is aiming
    lookX = 0;
    lookY = 0;

    // If the player is focused
    focus = false;

    constructor() {
        super();
    }

    private _updateLook() {
        // Update where the player is looking based on mouse
        const m = getMouse();

        // assignments
        this.lookX = m[0] - w / 2 + this.scene.camera.x;
        this.lookY = m[1] - h / 2 + this.scene.camera.y;

        // update the angle
        this._ang = getAngle(this.x, this.y, this.lookX, this.lookY);
    }

    private _handleMove() {
        this.focus = getKey("shift");

        const focusMult = this.focus ? PLAYER_SPEED_FOCUS_MULT : 1;

        const dx = getAxis(Axis.Horizontal) * focusMult;
        const dy = getAxis(Axis.Vertical) * focusMult;

        this.x += dx * PLAYER_SPEED_BASE * deltaTime;
        this.y += dy * PLAYER_SPEED_BASE * deltaTime;
    }

    update() {
        // update looking
        this._updateLook();

        // movement
        this._handleMove();
    }

    draw() {
        // set up canvas
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this._ang);

        // draw the image
        ctx.drawImage(
            this._img,
            -PLAYER_SPRITE_SIZE / 2,
            -PLAYER_SPRITE_SIZE / 2,
            PLAYER_SPRITE_SIZE,
            PLAYER_SPRITE_SIZE,
        );

        if (this.focus) {
            // draw the hitbox
            ctx.drawImage(
                this._hb,
                -PLAYER_HITBOX_RAD,
                -PLAYER_HITBOX_RAD,
                PLAYER_HITBOX_RAD * 2,
                PLAYER_HITBOX_RAD * 2,
            );
        }

        // return canvas to normalcy
        ctx.restore();

        // debug: draw mouse
        ctx.drawImage(this._cur, this.lookX - CURSOR_SIZE / 2, this.lookY - CURSOR_SIZE / 2, CURSOR_SIZE, CURSOR_SIZE);
    }

    async load() {
        // load the player sprite
        this._img = await loadImage("asg/pa_spaceship.png");

        // load the cursor sprite
        this._cur = await loadImage("asg/pa_cursor.png");

        // load the hitbox sprite
        this._hb = await loadImage("asg/pa_hitbox.png");
    }
}
