import * as cutscene_intro from "../cutscenes/cutscene_intro";
import { w, h, d, ctx } from "../engine";
import * as c from "../engine";
import { setScene } from "../index";

export function draw() {
    if (c.getKeyDown("keyp")) {
        c.startTimer("menu_fade", 3000);
    }

    d.rect(0, 0, w, h, "green");
    d.circ(c.mouseX, c.mouseY, 5, "red");

    let fadeTimer = c.timer("menu_fade");
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

export async function init() {}
