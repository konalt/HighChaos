import { CanvasStyle, ctx } from "../../lib/engine/engine";
import { settings } from "../../lib/engine/options";

const base = "#555555ff";
const shine = "#dbdbdbff";
const shinePosition = 0.3;

const fallback = "#a5a5a5ff";

export function linear(x0: number, y0: number, x1: number, y1: number): CanvasStyle {
    if (!settings.gradients) return fallback;
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, base);
    gradient.addColorStop(shinePosition, shine);
    gradient.addColorStop(shinePosition + 0.05, shine);
    gradient.addColorStop(1, base);
    return gradient;
}
