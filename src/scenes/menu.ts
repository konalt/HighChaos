import * as cutscene_intro from "../cutscenes/cutscene_intro";
import { w, h, d, ctx } from "../engine";
import * as c from "../engine";
import { setScene } from "../engine";
import * as hhctail from "../objects/hhctail";
import * as menubackground from "../objects/menubackground";
import * as menubutton from "../objects/menubutton";
import * as menucopyright from "../objects/menucopyright";
import * as menutitle from "../objects/menutitle";
import * as vignette from "../objects/vignette";
import { FadeDuration } from "../constants";
import { clamp } from "../utils";
import { easeInOutCirc, easeOutCirc, easeOutQuad } from "../ease";
import {
    detail,
    DetailLevelNames,
    nextDetail,
    nextResolution,
    ResolutionOptions,
    saveSettings,
    settings,
} from "../options";

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

function transition(next = []) {
    c.removeTimer("buttons");
    lastButtons = [...currentButtons];
    currentButtons = next;
    c.startTimer("hidebuttons", 200);
    c.startTimer("move_btns", 100);
}

type MenuOption = [string, () => void, string?];
const BackButton: MenuOption = [
    "Back",
    () => {
        transition(MainMenuButtons);
    },
];

const MainMenuButtons: MenuOption[] = [
    [
        "New Game",
        () => {
            transition(ExtraButtons);
        },
    ],
    [
        "Options",
        () => {
            transition();
            refreshOptions();
        },
    ],
    [
        "Extras",
        () => {
            transition(ExtraButtons);
        },
    ],
];
const OptionsButtons: MenuOption[] = [
    [
        "Resolution: %r",
        () => {
            console.log("resolution");

            nextResolution();
            refreshOptions();
            saveSettings();
        },
        "resbtn",
    ],
    [
        "Detail Level: %d",
        () => {
            console.log("detail");

            nextDetail();
            refreshOptions();
            saveSettings();
        },
        "detbtn",
    ],
    [
        "Gradients: %g",
        () => {
            console.log("grads");

            settings.gradients = !settings.gradients;
            refreshOptions();
            saveSettings();
        },
        "gbtn",
    ],
    BackButton,
];
const ExtraButtons: MenuOption[] = [
    [
        "We smoking Fire",
        () => {
            console.log("Lmao");
        },
    ],
    BackButton,
];

function refreshOptions() {
    currentButtons = OptionsButtons.map(
        (o) =>
            [
                o[0]
                    .replace(/%r/g, ResolutionOptions[settings.resolution][1])
                    .replace(/%d/g, DetailLevelNames[settings.detailLevel])
                    .replace(/%g/g, settings.gradients ? "Enabled" : "Disabled"),
                o[1],
                o[2],
            ] as MenuOption
    );
}

let currentButtons: MenuOption[] = MainMenuButtons;
let lastButtons: MenuOption[] = [];

const MenuButtonX = 100;
const MenuButtonStartY = 400;
const MenuButtonGap = 150;
const MenuButtonTransitionDistance = 1000;

export function draw() {
    ctx.save();
    ctx.translate(MenuButtonX, MenuButtonStartY);
    let mbi = 0;
    for (const mb of currentButtons) {
        let c = menubutton.think(0, 0, mb[0], mb[1], false, mb[2] ?? mb[0]);
        if (c) break;
        ctx.translate(0, MenuButtonGap);
        mbi++;
    }
    ctx.restore();

    menubackground.draw();
    if (detail(1)) {
        if (settings.gradients) {
            vignette.draw("black", 1, 0.5, 1.1);
        } else {
            d.rect(0, 0, w, h, "rgba(0,0,0,0.5)");
        }
    }

    menutitle.draw(500, 120);
    hhctail.draw(MenuButtonX, 280, 34);

    c.timerEnd("move_btns", () => {
        c.startTimer("buttons", 500);
    });

    ctx.save();
    ctx.translate(MenuButtonX, MenuButtonStartY);
    mbi = 0;
    for (const mb of lastButtons) {
        menubutton.draw(0, 0, mb[0], 1 - c.timer("hidebuttons"), mb[2] ?? mb[0]);
        ctx.translate(0, MenuButtonGap);
        mbi++;
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(MenuButtonX, MenuButtonStartY);
    mbi = 0;
    for (const mb of currentButtons) {
        let buttonTimer = clamp(c.timer("buttons", false) - mbi * 0.1);
        let offset = easeOutCirc(buttonTimer) * MenuButtonTransitionDistance;
        menubutton.draw(offset - MenuButtonTransitionDistance, 0, mb[0], 1, mb[2] ?? mb[0]);
        ctx.translate(0, MenuButtonGap);
        mbi++;
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    menucopyright.draw();

    fade();
}

export async function init() {
    c.setFont("'Futuristic Armour', sans-serif");
    c.startTimer("menu_fade_in", FadeDuration, true);
    c.startTimer("move_btns", FadeDuration * 0.5);
    await menutitle.preload();
}
