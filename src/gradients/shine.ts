import { ctx } from "../engine";

const base = "rgba(255,255,255, 0)";
const shine = "rgba(255,255,255, 255)";
const shinePosition = 0.3;

export function linear(x0: number, y0: number, x1: number, y1: number, position = shinePosition): CanvasGradient {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, base);
    gradient.addColorStop(position - 0.025, shine);
    gradient.addColorStop(position + 0.025, shine);
    gradient.addColorStop(1, base);
    return gradient;
}
