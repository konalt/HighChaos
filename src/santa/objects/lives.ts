import { ctx, d, loadImage, w } from "../../lib/engine/engine";
import { lives } from "../scenes/game";

let img: HTMLImageElement;

export function draw() {
    ctx.save();
    ctx.translate(w - 20, 20);
    for (let i = 0; i < lives; i++) {
        d.quickImage(img, 0, 0, 0.6, "tr");
        ctx.translate(-100, 0);
    }
    ctx.restore();
}

export async function load() {
    img = await loadImage("santa/baby.png");
}
