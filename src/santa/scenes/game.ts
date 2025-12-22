import { loadImage } from "../../engine/engine";
import * as skydark from "../objects/skydark";
import * as snow from "../objects/snow";
import * as hillsfront from "../objects/hillsfront";

export function draw() {
    skydark.draw();

    snow.draw(false);

    hillsfront.draw();

    snow.draw(true);
}

export async function init() {
    snow.init();
}
