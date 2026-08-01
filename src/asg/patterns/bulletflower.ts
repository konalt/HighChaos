import { globalTimer, since } from "../../lib/engine/engine";
import { clamp, getAngle, lerp } from "../../lib/engine/utils";
import { bulletArc } from "../bullets";
import { ASGBPContext, ASGBulletPattern } from "./base";

export class BPBulletFlower extends ASGBulletPattern {
    update(ctx: ASGBPContext): void {
        for (const b of this.bullets) {
            b.velocity[0] = lerp(clamp(since(b.spawnTime) / 1200), 1000, 100);
        }
    }

    start(ctx: ASGBPContext): void {
        this.setInterval((ctx) => {
            this.bullets.push(
                ...bulletArc(
                    {
                        speed: 500,
                        angularVelocity: 0.1,
                    },
                    ctx.origin,
                    20,
                    0,
                    getAngle(...ctx.origin, ...ctx.target),
                ),
            );
        }, 300);
    }
}
