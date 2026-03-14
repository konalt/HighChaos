import { ctx, d, font } from "../../lib/engine/engine";
import { getSavedBest } from "../save";
import { score } from "../scenes/game";

let best = 0;

export function draw() {
    const txt = `Score: ${score}\n(Best: ${best})`;
    ctx.textBaseline = "top";
    d.text(0, 0, txt, "white", font(48), "left");
}

export function init() {
    best = getSavedBest();
}
