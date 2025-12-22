import { ctx, h, w } from "../../engine/engine";

export function draw(color: string, opacity = 0.5, internalRadius = 0.9, externalRadius = 1.5, aspectMod = 1) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale((w / h) * aspectMod, 1);

    let grad = ctx.createRadialGradient(0, 0, (internalRadius * h) / 2, 0, 0, (externalRadius * h) / 2);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, color);

    ctx.globalAlpha = opacity;
    ctx.fillStyle = grad;
    ctx.fillRect(-w / 2 - 10, -h / 2 - 10, w + 10, h + 10);
    ctx.globalAlpha = 1;

    ctx.restore();
}
