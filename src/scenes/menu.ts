import * as cutscene_intro from "../cutscenes/cutscene_intro";
import { w, h, d, ctx } from "../engine";
import * as c from "../engine";
import { setScene } from "../engine";
import * as menutitle from "../objects/menutitle";
import * as menubutton from "../objects/menubutton";
import * as menucopyright from "../objects/menucopyright";
import * as vignette from "../objects/vignette";
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

const MenuButtons: [string, () => void][] = [
    [
        "New Game",
        () => {
            console.log("play the game");
        },
    ],
    [
        "Options",
        () => {
            console.log("open the options");
        },
    ],
    [
        "Extras",
        () => {
            console.log("open the extras");
        },
    ],
];
const MenuButtonX = 100;
const MenuButtonStartY = 400;
const MenuButtonGap = 150;

export function draw() {
    d.rect(0, 0, w, h, "rgba(66, 66, 66, 1)");
    vignette.draw("black", 1);
    menutitle.draw(500, 120);

    ctx.save();
    ctx.translate(MenuButtonX, MenuButtonStartY);
    for (const mb of MenuButtons) {
        menubutton.draw(0, 0, ...mb);
        ctx.translate(0, MenuButtonGap);
    }
    ctx.restore();

    menucopyright.draw();

    fade();
}

export async function init() {
    c.setFont("'Futuristic Armour', sans-serif");
    c.startTimer("menu_fade_in", FadeDuration, true);
    await menutitle.preload();
}
