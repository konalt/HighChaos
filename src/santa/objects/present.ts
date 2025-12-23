import { d, loadImage } from "../../engine/engine";

let img: HTMLImageElement;

export function draw(x: number, y: number) {
    d.quickImage(img, x, y, 0.2);
}

export async function load() {
    img = await loadImage("santa/gift.png");
}
