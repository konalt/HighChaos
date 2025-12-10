import { CanvasStyle, ctx } from "../engine";
import { settings } from "../options";

const base = "#d1d1d1ff";
const shine = "#f3f3f3ff";
const shinePosition = 0.3;

const fallback = "#dededeff";

export function linear(x0: number, y0: number, x1: number, y1: number): CanvasStyle {
    if (!settings.gradients) return fallback;
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, base);
    gradient.addColorStop(shinePosition, shine);
    gradient.addColorStop(shinePosition + 0.5, shine);
    gradient.addColorStop(1, base);
    return gradient;
}
