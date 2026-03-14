import { d, font, h, w } from "../../lib/engine/engine";
import * as skydark from "../objects/skydark";
import * as hillsfront from "../objects/hillsfront";
import * as snow from "../objects/snow";
import * as playbutton from "../objects/playbutton";
import { getSavedBest, saveBest } from "../save";

let presentsCollected = 0;
let best = 0;
let isNewBest = false;

const scw = 700;

export function draw() {
    skydark.draw();

    snow.draw(false);
    hillsfront.draw();
    snow.draw(true);

    d.rect(w / 2, h / 2, scw, h * 0.9, "rgba(0,0,0,0.5)", "transparent", 0, "cc");
    d.text(w / 2, 400, "Game Over", "white", font(60), "center");
    d.text(w / 2, 500, `You collected ${presentsCollected} presents!`, "white", font(48), "center");

    if (isNewBest) {
        d.text(w / 2, 600, `New best!`, "yellow", font(48), "center");
    } else {
        d.text(w / 2, 600, `Best: ${best}`, "yellow", font(48), "center");
    }

    playbutton.draw(w / 2, 800);
}

export async function init(init: Record<string, any>) {
    presentsCollected = init.presents;
    isNewBest = saveBest(presentsCollected);
    if (!isNewBest) {
        best = getSavedBest();
    } else {
        best = presentsCollected;
    }
}
