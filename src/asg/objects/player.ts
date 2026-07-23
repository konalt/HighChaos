import {
    Axis,
    ctx,
    d,
    deltaTime,
    getAxis,
    getKey,
    getMouse,
    globalTimer,
    h,
    loadImage,
    loadSounds,
    playSound,
    w,
} from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { Scene } from "../../lib/engine/scene";
import { getAngle, grey, lerp, ThreeNums } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import {
    PLAYER_SPEED_FOCUS_MULT,
    PLAYER_SPEED_BASE,
    PLAYER_SPRITE_SIZE,
    PLAYER_HITBOX_RAD,
    PLAYER_GRAZE_RADIUS,
} from "../config";
import { ASGInGameScene } from "../scenes/ingame";
import { circlesIntersect } from "../util";

const CURSOR_SIZE = 30;
const GRAZE_EFFECT_DURATION = 200;

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

    // Graze indicator shit
    showGrazeIndicator = false;

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

    private _handleCollisions() {
        if (!(this.scene instanceof ASGInGameScene)) throw "fuck you";

        this.showGrazeIndicator = false;
        for (const b of this.scene.bullets) {
            const bulletCirc: ThreeNums = [b.x, b.y, b.hitboxRadius];

            // grazing
            if (circlesIntersect(...bulletCirc, this.x, this.y, PLAYER_GRAZE_RADIUS)) {
                if (!b.grazed) {
                    playSound("asg_graze", 0.5);

                    b.grazed = true;

                    this.objStartTimer("graze", GRAZE_EFFECT_DURATION);
                }

                // since we are in grazing radius we show the thing
                this.showGrazeIndicator = true;
            }
        }
    }

    update() {
        // update looking
        this._updateLook();

        // movement
        this._handleMove();

        this._handleCollisions();
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

        if (this.showGrazeIndicator) {
            d.circ(
                0,
                0,
                PLAYER_GRAZE_RADIUS,
                "transparent",
                `rgba(255,255,255,${lerp(this.objTimer("graze", true), 1, 0.2)}`,
                1,
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

        await loadSounds([`asg/graze`]);
    }
}
