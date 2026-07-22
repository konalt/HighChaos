import { ctx, deltaTime, loadImage } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { getAngle, TwoNums, valueInRange } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { BULLET_DATA, BulletType } from "../bullettypes";
import { ASGInGameScene } from "../scenes/ingame";

// initialize all bullet sprites to null
const bulletSprites: Record<BulletType, HTMLImageElement | null> = {
    [BulletType.BallSmall]: null,
    [BulletType.BallBig]: null,
    [BulletType.PillSmall]: null,
    [BulletType.PillBig]: null,
};

export class ASGBullet extends GameObject {
    totalDistanceTravelled = 0;

    // velocity
    velocity: TwoNums = [0, 0];

    // angular shit
    angle = 0;
    angularVelocity = 0;

    // type
    type: BulletType = BulletType.BallSmall;
    isPlayerBullet = false;

    scale = 0;

    constructor() {
        super();
    }

    update(): void {
        // we only support ingame scene
        if (!(this.scene instanceof ASGInGameScene)) return;

        // use angular velocity
        this.angle += this.angularVelocity * deltaTime;

        // rotate velocity by _ang
        const dxActual = this.velocity[0] * Math.cos(this.angle) - this.velocity[1] * Math.sin(this.angle);
        const dyActual = this.velocity[0] * Math.sin(this.angle) + this.velocity[1] * Math.cos(this.angle);

        // update position
        this.x += dxActual * deltaTime;
        this.y += dyActual * deltaTime;

        this.totalDistanceTravelled += (Math.abs(dxActual) + Math.abs(dyActual)) * deltaTime;

        // out of bounds check
        if (this.totalDistanceTravelled > 1e4) {
            this.enabled = false;
            this.scene.remove(this);
        }
    }

    draw() {
        const bsp = bulletSprites[this.type];
        if (bsp == null) {
            bulletSprites[this.type] = NULLTEXTURE;
            loadImage("asg/bullet/" + BulletType[this.type] + ".png").then((spr) => {
                bulletSprites[this.type] = spr;
            });
            return;
        }

        // set up canvas
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const renderScale = BULLET_DATA[this.type].defaultRenderScale;

        // draw the image
        ctx.drawImage(
            bsp,
            (-bsp.width / 2) * this.scale * renderScale,
            (-bsp.height / 2) * this.scale * renderScale,
            bsp.width * this.scale * renderScale,
            bsp.height * this.scale * renderScale,
        );

        // return to normalcy
        ctx.restore();
    }

    async load() {
        // load the sprite if its not loaded already
        if (bulletSprites[this.type] == null) {
            bulletSprites[this.type] = await loadImage("asg/pa_enemy.png");
        }
    }
}
