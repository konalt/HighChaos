import { w, h, loadImage, d, loadSounds } from "../../engine/engine";
import * as skydark from "../objects/skydark";
import * as hillsfront from "../objects/hillsfront";
import * as snow from "../objects/snow";
import * as playbutton from "../objects/playbutton";
import * as mutebutton from "../objects/mutebutton";

let title: HTMLImageElement;
let instructions: HTMLImageElement;

export function draw() {
    skydark.draw();
    snow.draw(false);
    hillsfront.draw();
    snow.draw(true);

    d.circ(w / 2, h * 3.7, h * 3, "rgba(0,0,0,0.5)");

    d.quickImage(title, w / 2, 0, 1.5, "tc");
    d.quickImage(instructions, w / 2, 535, 0.8, "cc");

    playbutton.draw(w / 2, 970);
    mutebutton.draw();
}

export async function init() {
    snow.init();
    instructions = await loadImage("santa/instructions.png");
    title = await loadImage("santa/title.png");
    await mutebutton.load();
    await loadSounds([`santa/hohoho`, `santa/merrychristmas`, `santa/sleighbells`, `santa/baby`]);
}
