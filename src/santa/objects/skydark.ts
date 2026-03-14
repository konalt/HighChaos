import { ctx, d, h, w } from "../../lib/engine/engine";

const stretchFactor = 0.8;

export function draw() {
    ctx.save();
    ctx.scale(1, stretchFactor);
    const g = ctx.createRadialGradient(
        w / 2,
        (h / stretchFactor) * 1.25,
        0,
        w / 2,
        (h / stretchFactor) * 1.25,
        w * 0.6,
    );
    g.addColorStop(0, "#0D6FBF");
    g.addColorStop(1, "#000E33");
    d.rect(0, 0, w, h / stretchFactor, g);
    ctx.restore();
}
