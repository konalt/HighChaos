import { easeInCirc, easeInOutCirc, easeInOutQuad, easeOutCirc } from "../ease";
import { w, h, d, ctx } from "../engine";
import * as c from "../engine";
import { drawDistyBottle } from "../objects/distybottle";

export function draw() {
    d.rect(0, 0, w, h, "#112");

    c.timerEnd("intro_fade", () => {
        c.startTimer("cap_rotate", 3000);
        c.startTimer("start_cap_lift", 500);
    });
    c.timerEnd("start_cap_lift", () => {
        c.startTimer("cap_lift", 3000);
    });

    drawDistyBottle(w / 2, h / 2, easeInOutQuad(c.timer("cap_rotate")), easeInOutQuad(c.timer("cap_lift")));

    // CROSS fade ahahaha get it?
    let fadeTimer = c.timer("intro_fade");
    ctx.globalAlpha = fadeTimer;
    d.rect(0, 0, w, h, "black");
    ctx.globalAlpha = 1;
}

export function init() {
    c.startTimer("intro_fade", 4000, true);
}
