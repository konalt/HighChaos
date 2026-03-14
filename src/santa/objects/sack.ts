import { ctx, d, loadImage, timer } from "../../lib/engine/engine";

let img: HTMLImageElement;

export const SackGrabWidth = 140;
export const SackGrabHeightMin = 200;

export const PowerUpMargin = 0.1;
export const PowerUpScale = 2;

export function getStretch() {
    const pu = timer("powerup");
    if (pu) {
        if (pu < PowerUpMargin) {
            return 1 + (pu / PowerUpMargin) * PowerUpScale;
        } else if (pu > 1 - PowerUpMargin) {
            return 1 + (1 - (pu - (1 - PowerUpMargin)) / PowerUpMargin) * PowerUpScale;
        } else {
            return 1 + PowerUpScale;
        }
    }
    return 1;
}

export function draw(x: number, y: number) {
    let stretch = getStretch();

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(stretch, 1);
    d.quickImage(img, 0, 0, 0.4, "bc");
    ctx.restore();
}

export async function load() {
    img = await loadImage("santa/sack.png");
}
