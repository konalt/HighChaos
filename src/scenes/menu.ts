import * as cutscene_intro from "../cutscenes/cutscene_intro";
import { w, h, d, ctx } from "../engine";
import * as c from "../engine";
import { setScene } from "../engine";
import * as menutitle from "../objects/menutitle";
import { FadeDuration } from "../constants";

function fade() {
    let fadeTimer = c.timer("menu_fade") || c.timer("menu_fade_in");
    if (fadeTimer > 0) {
        ctx.globalAlpha = fadeTimer;
        d.rect(0, 0, w, h, "black");
        ctx.globalAlpha = 1;
    }
    c.timerEnd(
        "menu_fade",
        () => {
            setScene(cutscene_intro);
        },
        false
    );
}

export function draw() {
    d.rect(0, 0, w, h, "black");
    menutitle.draw(w / 2, h / 2);
    fade();
}

export async function init() {
    c.setFont("'Futuristic Armour', sans-serif");
    c.startTimer("menu_fade_in", FadeDuration, true);
    await menutitle.preload();
}
