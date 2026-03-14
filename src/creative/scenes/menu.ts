import { d, h, loadImage, w } from "../../engine/engine";
import * as sky from "../objects/sky";

let titleImage: HTMLImageElement;

export function draw() {
    sky.draw();

    d.quickImage(titleImage, w / 2, h / 5, 1.5);
}

export async function init() {
    titleImage = await loadImage("creative/txt/title.png");

    // Place init code here:
    //object1.init();
    //await object2.load();
    //image = await loadImage("path/image.png");
    //await loadSounds([`path/sound`]);
}
