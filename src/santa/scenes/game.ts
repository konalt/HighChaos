import {
    Axis,
    deltaTime,
    getAxis,
    getKey,
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
import * as mutebutton from "../objects/mutebutton";
import { clamp, FourNums, lerpPositions, TwoNums, valueInRange } from "../../engine/utils";
import { easeOutCirc } from "../../engine/ease";

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

let sackX = w / 2;
const sackSpeed = 80;
const sprintMult = 1.7;

function movement() {
    let a = getAxis(Axis.Horizontal);
    sackX += a * deltaTime * sackSpeed * (getKey("shiftleft") ? sprintMult : 1);
    sackX = clamp(sackX, 0, w);
}

export function draw() {
    skydark.draw();
    snow.draw(false);
    hillsfront.draw();

    movement();

    const catchXMin = sackX - (sack.getStretch() * sack.SackGrabWidth) / 2;
    const catchXMax = sackX + (sack.getStretch() * sack.SackGrabWidth) / 2;

    let i = 0;
    for (const p of presents) {
        if (!p[1]) {
            p[0][0] += p[0][2];
            p[0][1] += p[0][3] * globalGravity;
            present.draw(p[0][0], p[0][1]);
        } else {
            let t = timer(`pc${i}`);
            let ease = easeOutCirc(t);
            let lerped = lerpPositions(ease, p[0][0], p[0][1], sackX, h - sack.SackGrabHeightMin / 2);
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
                setScene(scene_gameover, true, {
                    presents: score,
                });
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

    sack.draw(sackX, h);

    snow.draw(true);

    score_display.draw();
    lives_display.draw();

    mutebutton.draw();
}

export async function init() {
    presents = [createPresent(), createPresent(), createPresent(), createPresent()];
    globalGravity = 1;
    score = 0;
    lives = 0;
    snow.init();
    score_display.init();
    await present.load();
    await sack.load();
    await lives_display.load();
}
