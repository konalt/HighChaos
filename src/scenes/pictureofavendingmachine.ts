import { MenuFont } from "../constants";
import { ctx, d, fadeToScene, font, getKeyDown, h, isFading, loadImage, setFont, w } from "../engine";
import * as menu from "./menu";

const Gap = 150;

let vendingMachineImage: HTMLImageElement;

export function draw() {
    ctx.textBaseline = "middle";
    d.rect(0, 0, w, h, "black");
    d.text(w / 2, Gap, "Picture of a Vending Machine", "white", font(96), "center");
    d.quickImage(vendingMachineImage, w / 2, h / 2, 1, "cc");
    d.text(w / 2, h - Gap, "Click anywhere to return", "white", font(50), "center");
    if (!isFading && getKeyDown("mouse1")) {
        fadeToScene(menu);
    }
}

export async function init() {
    setFont(MenuFont);
    vendingMachineImage = await loadImage("vendingmachine.png");
}
