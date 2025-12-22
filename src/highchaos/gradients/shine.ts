import { CanvasStyle, ctx } from "../../engine/engine";
import { settings } from "../../engine/options";

const base = "#ffffff00";
const shine = "#ffffff9e";
const shinePosition = 0.3;

const fallback = "#ffffff18";

export function linear(x0: number, y0: number, x1: number, y1: number, position = shinePosition): CanvasStyle {
    if (!settings.gradients) return fallback;
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, base);
    gradient.addColorStop(position - 0.1, base);
    gradient.addColorStop(position - 0.025, shine);
    gradient.addColorStop(position + 0.025, shine);
    gradient.addColorStop(position + 0.1, base);
    gradient.addColorStop(1, base);
    return gradient;
}
