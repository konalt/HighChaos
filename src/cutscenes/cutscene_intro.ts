import { w, h, d, ctx } from "../engine";
import * as c from "../engine";
import { drawDistyBottle } from "../objects/distybottle";

export function draw() {
    d.rect(0, 0, w, h, "#112");

    drawDistyBottle(w / 2, h / 2);

    // CROSS fade ahahaha get it?
    let fadeTimer = 1 - c.timer("intro_fade");
    ctx.globalAlpha = fadeTimer;
    d.rect(0, 0, w, h, "black");
    ctx.globalAlpha = 1;
}

export function init() {
    c.startTimer("intro_fade", 5000);
}
