import {
    getMouse,
    h,
    loadImage,
    loadSounds,
    playSound,
    setScene,
    startTimer,
    timer,
    timerEnd,
    w,
} from "../../engine/engine";
import * as skydark from "../objects/skydark";
import * as snow from "../objects/snow";
import * as hillsfront from "../objects/hillsfront";
import * as present from "../objects/present";
import * as sack from "../objects/sack";
import * as score_display from "../objects/score";
import * as lives_display from "../objects/lives";
import * as scene_gameover from "./gameover";
import { FourNums, lerpPositions, TwoNums, valueInRange } from "../../engine/utils";
import { easeInOutCirc, easeOutCirc } from "../../engine/ease";

let globalGravity = 1;
export let score = 0;

let presents: [FourNums, boolean][] = [];

function createPresent(): [FourNums, boolean] {
    return [[Math.random() * w * 0.7 + w * 0.15, -50, (Math.random() - 0.5) * 2, 2 + Math.random() * 3], false];
}

export let lives = 10;
let powerup = false;

function doLevelup() {
    if (score % 5 == 0) {
        globalGravity += 0.1;
    }
    if (score % 10 == 0) {
        presents.push(createPresent());
    }
    if (score > 10 && Math.random() < 0.03 && !powerup) {
        playSound("santa_sleighbells", 0.6);
        powerup = true;
        startTimer("powerup", 7000);
    }
}

export function draw() {
    skydark.draw();
    snow.draw(false);
    hillsfront.draw();

    const mouse = getMouse();
    const catchXMin = mouse[0] - (sack.getStretch() * sack.SackGrabWidth) / 2;
    const catchXMax = mouse[0] + (sack.getStretch() * sack.SackGrabWidth) / 2;

    let i = 0;
    for (const p of presents) {
        if (!p[1]) {
            p[0][0] += p[0][2];
            p[0][1] += p[0][3] * globalGravity;
            present.draw(p[0][0], p[0][1]);
        } else {
            let t = timer(`pc${i}`);
            let ease = easeOutCirc(t);
            let lerped = lerpPositions(ease, p[0][0], p[0][1], mouse[0], h - sack.SackGrabHeightMin / 2);
            present.draw(...lerped);
            timerEnd(
                `pc${i}`,
                () => {
                    presents[i] = createPresent();
                },
                true
            );
        }
        if (
            !p[1] &&
            valueInRange(p[0][0], catchXMin, catchXMax) &&
            valueInRange(p[0][1], h - sack.SackGrabHeightMin, h)
        ) {
            playSound("santa_hohoho", 0.6);
            score++;
            doLevelup();
            startTimer(`pc${i}`, 700);
            p[1] = true;
        }
        if (p[0][1] > h + 50) {
            lives--;
            if (lives == 0) {
                setScene(scene_gameover, false);
            }
            playSound("santa_baby", 0.5);
            presents[i] = createPresent();
        }
        i++;
    }

    timerEnd(
        "powerup",
        () => {
            powerup = false;
        },
        true
    );

    sack.draw(getMouse()[0], h);

    snow.draw(true);

    score_display.draw();
    lives_display.draw();
}

export async function init() {
    presents = [createPresent(), createPresent(), createPresent()];
    snow.init();
    await present.load();
    await sack.load();
    await lives_display.load();

    await loadSounds([`santa/hohoho`, `santa/merrychristmas`, `santa/sleighbells`, `santa/baby`]);
}
