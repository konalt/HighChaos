import * as cutscene_intro from "../cutscenes/cutscene_intro";
import * as vendingscene from "../scenes/pictureofavendingmachine";
import { w, h, d, ctx } from "../engine";
import * as c from "../engine";
import { setScene } from "../engine";
import * as hhctail from "../objects/hhctail";
import * as menubackground from "../objects/menubackground";
import * as menubutton from "../objects/menubutton";
import * as menucopyright from "../objects/menucopyright";
import * as menusavegame from "../objects/menusavegame";
import * as menutitle from "../objects/menutitle";
import * as vignette from "../objects/vignette";
import { FadeDuration } from "../constants";
import { alpha, clamp, Scene } from "../utils";
import { easeOutCirc } from "../ease";
import {
    detail,
    DetailLevelNames,
    nextDetail,
    nextResolution,
    ResolutionOptions,
    saveSettings,
    settings,
} from "../options";
import { savedGames } from "../saves";

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
        "Play",
        () => {
            c.removeTimer("saves_fade");
            c.startTimer("title_hide", 200);
            c.startTimer("saves", 500);
            transition();
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
            nextResolution();
            refreshOptions();
            saveSettings();
        },
        "resbtn",
    ],
    [
        "Detail Level: %d",
        () => {
            nextDetail();
            refreshOptions();
            saveSettings();
        },
        "detbtn",
    ],
    [
        "Gradients: %g",
        () => {
            settings.gradients = !settings.gradients;
            refreshOptions();
            saveSettings();
        },
        "gbtn",
    ],
    [
        "Animations: %e",
        () => {
            settings.easing = !settings.easing;
            refreshOptions();
            saveSettings();
        },
        "ebtn",
    ],
    BackButton,
];
const ExtraButtons: MenuOption[] = [
    [
        "Vending Machine",
        () => {
            c.fadeToScene(vendingscene);
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
                    .replace(/%g/g, settings.gradients ? "Enabled" : "Disabled")
                    .replace(/%e/g, settings.easing ? "Fancy" : "Fast"),
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
const MenuButtonTransitionDistance = w;
const MenuButtonTransitionDuration = 500;
const MenuButtonTransitionOffset = 0.2;

const MenuSaveY = 500;
const MenuSaveTransitionDistance = 1200;
const MenuSaveGap = 650;

export function draw() {
    let interactable = !c.isFading;
    let mbi = 0;
    let saveTimer = clamp(c.timer("saves", false) - 0.5);
    let saveBackOffset = (1 - easeOutCirc(saveTimer)) * MenuSaveTransitionDistance;
    if (interactable) {
        ctx.save();
        ctx.translate(MenuButtonX, MenuButtonStartY);
        for (const mb of currentButtons) {
            let buttonTimer = clamp(c.timer("buttons", false) - mbi * MenuButtonTransitionOffset);
            let offset = easeOutCirc(buttonTimer) * MenuButtonTransitionDistance;
            let clicked = menubutton.think(
                offset - MenuButtonTransitionDistance,
                0,
                mb[0],
                mb[1],
                false,
                mb[2] ?? mb[0]
            );
            if (clicked) break;
            ctx.translate(0, MenuButtonGap);
            mbi++;
        }
        ctx.restore();

        if (c.timer("saves_fade") == 0) {
            ctx.save();
            ctx.translate(w / 2 - MenuSaveGap, MenuSaveY);
            for (let i = 0; i < 3; i++) {
                let saveTimer = clamp(c.timer("saves", false) - i * 0.1);
                let offset = (1 - easeOutCirc(saveTimer)) * MenuSaveTransitionDistance;
                menusavegame.think(0, offset, i, savedGames[i]);
                ctx.translate(MenuSaveGap, 0);
            }
            ctx.restore();
        }

        ctx.save();
        ctx.translate(60, h - 100);
        menubutton.think(
            0,
            saveBackOffset,
            "Back",
            () => {
                transition(MainMenuButtons);
                c.startTimer("title_hide", 200, true);
                c.startTimer("saves_fade", 100);
            },
            c.timer("saves_fade") > 0,
            "saveback"
        );
        ctx.restore();
    }

    menubackground.draw();
    if (detail(1)) {
        if (settings.gradients) {
            vignette.draw("black", 1, 0.5, 1.1);
        } else {
            d.rect(0, 0, w, h, "rgba(0,0,0,0.5)");
        }
    }

    if (alpha(1 - c.timer("title_hide"))) {
        menutitle.draw(500, 120);
        hhctail.draw(MenuButtonX, 280, 34);
        alpha();
    }

    c.timerEnd("move_btns", () => {
        c.startTimer("buttons", MenuButtonTransitionDuration);
    });

    if (alpha(1 - c.timer("hidebuttons"), false)) {
        ctx.save();
        ctx.translate(MenuButtonX, MenuButtonStartY);
        mbi = 0;
        for (const mb of lastButtons) {
            menubutton.draw(0, 0, mb[0], 1 - c.timer("hidebuttons"), mb[2] ?? mb[0]);
            ctx.translate(0, MenuButtonGap);
            mbi++;
        }
        ctx.restore();
        alpha;
    }

    ctx.save();
    ctx.translate(MenuButtonX, MenuButtonStartY);
    mbi = 0;
    for (const mb of currentButtons) {
        let buttonTimer = clamp(c.timer("buttons", false) - mbi * MenuButtonTransitionOffset);
        let offset = easeOutCirc(buttonTimer) * MenuButtonTransitionDistance;
        menubutton.draw(offset - MenuButtonTransitionDistance, 0, mb[0], 1, mb[2] ?? mb[0]);
        ctx.translate(0, MenuButtonGap);
        mbi++;
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    if (c.timer("saves") > 0 && alpha(1 - c.timer("saves_fade"), false)) {
        ctx.save();
        ctx.translate(w / 2 - MenuSaveGap, MenuSaveY);
        for (let i = 0; i < 3; i++) {
            let saveTimer = clamp(c.timer("saves", false) - i * 0.1);
            let offset = (1 - easeOutCirc(saveTimer)) * MenuSaveTransitionDistance;
            menusavegame.draw(0, offset, i, 1 - c.timer("saves_fade"), savedGames[i]);
            ctx.translate(MenuSaveGap, 0);
        }
        ctx.restore();
        ctx.save();
        ctx.translate(50, h - 85);
        menubutton.draw(0, saveBackOffset, "Back", 1 - c.timer("saves_fade"), "saveback");
        ctx.restore();
    }

    menucopyright.draw();
}

export async function init() {
    currentButtons = MainMenuButtons;
    lastButtons = [];
    c.removeTimer("buttons");
    c.setFont("'Futuristic Armour', sans-serif");
    c.startTimer("move_btns", FadeDuration * 0.5);
    await menutitle.preload();
}
