import { ctx, deltaTime, globalTimer, loadImage, timerEnd } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { getAngle, TwoNums } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { basicShootBullet, bulletArc } from "../bullets";
import { BulletType } from "../bullettypes";
import { ENEMY_SPRITE_SIZE } from "../config";
import { ASGInGameScene } from "../scenes/ingame";

// store sprite here so we dont have to waste memory on it
let sprite = NULLTEXTURE;
let spriteLoaded = false;

export class ASGEnemy extends GameObject {
    private _ang = 0;

    // where the enemy wants to look
    targetX = 0;
    targetY = 0;

    rotateSpeed = 5;

    constructor() {
        super();
    }

    // update looking shit
    private _updateLook() {
        // target angle to look at
        const targetAngle = getAngle(this.x, this.y, this.targetX, this.targetY);
        let angleDifference = targetAngle - (this._ang % (Math.PI * 2));

        if (angleDifference > Math.PI) {
            angleDifference = Math.PI * 2 - angleDifference;
        }

        if (angleDifference < -Math.PI) {
            angleDifference = -Math.PI * 2 - angleDifference;
        }

        if (Math.abs(angleDifference) < this.rotateSpeed * deltaTime) {
            this._ang = targetAngle;
        } else {
            this._ang += this.rotateSpeed * Math.sign(angleDifference) * deltaTime;
        }
    }

    update(): void {
        // we only support ingame scene
        if (!(this.scene instanceof ASGInGameScene)) return;

        // look at the player
        this.targetX = this.scene.player.x;
        this.targetY = this.scene.player.y;
        this._updateLook();

        this.objTimerEnd(
            "shoot",
            () => {
                bulletArc(
                    {
                        angularVelocity: -0.1,
                    },
                    [this.x, this.y],
                    12,
                    0,
                    globalTimer * 0.001,
                );
                this.objStartTimer("shoot", 150);
            },
            false,
        );
    }

    draw() {
        // set up canvas
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this._ang);

        // draw the image
        ctx.drawImage(sprite, -ENEMY_SPRITE_SIZE / 2, -ENEMY_SPRITE_SIZE / 2, ENEMY_SPRITE_SIZE, ENEMY_SPRITE_SIZE);

        // return to normalcy
        ctx.restore();
    }

    async load() {
        // load the sprite if its not loaded already
        if (!spriteLoaded) {
            sprite = await loadImage("asg/pa_enemy.png");
            spriteLoaded = true; // mark it as loaded
        }
    }

    init() {
        this.objStartTimer("shoot", 200);
    }
}
