import { easeInOutQuad } from "../../lib/engine/ease";
import { w, h, d, ctx } from "../../lib/engine/engine";
import * as c from "../../lib/engine/engine";
import { drawDistyBottle } from "../objects/distybottle";
import * as knife from "../objects/knife";
import { clamp, degToRad, lerp, lerpPositions, TwoNums } from "../../lib/engine/utils";

const distyPosition: TwoNums = [w / 2, h / 2];

const knifeActionDuration = 7000;
const knifeMoveAction = 0.35;
const knifeSwayAction = 0.3;
const knifePositionStart: TwoNums = [1600, -100];
const knifeRotationStart = degToRad(-80);
const knifePositionMid: TwoNums = [w * 0.51, h * 0.49];
const knifeRotationMid = degToRad(-170);
const knifePositionFinal: TwoNums = [2100, -100];
const knifeRotationFinal = degToRad(30);
const knifeSwayRotation = degToRad(-180) - knifeRotationMid;
const knifeSwayAmount = knifePositionMid[0] - distyPosition[0];
const knifeSwaySpeed = 20;

function getKnifePositionAndRotation(): [TwoNums, number] {
    let knifeTimer = c.timer("knife_action");
    if (knifeTimer < knifeMoveAction) {
        const subtimer = easeInOutQuad(clamp(knifeTimer / knifeMoveAction));
        const knifePosition = lerpPositions(subtimer, ...knifePositionStart, ...knifePositionMid);
        const knifeRotation = lerp(subtimer, knifeRotationStart, knifeRotationMid);
        return [knifePosition, knifeRotation];
    } else if (knifeTimer < knifeSwayAction + knifeMoveAction) {
        const subtimer = easeInOutQuad(clamp((knifeTimer - knifeMoveAction) / knifeSwayAction)) * knifeSwaySpeed;
        const knifePosition: TwoNums = [distyPosition[0] + Math.cos(subtimer) * knifeSwayAmount, knifePositionMid[1]];
        const knifeRotation = degToRad(-180) - Math.cos(subtimer) * knifeSwayRotation;
        return [knifePosition, knifeRotation];
    } else {
        const lastPosition: TwoNums = [
            distyPosition[0] + Math.cos(knifeSwaySpeed) * knifeSwayAmount,
            knifePositionMid[1],
        ];
        const lastRotation = degToRad(-180) - Math.cos(knifeSwaySpeed) * knifeSwayRotation;
        const subtimer = easeInOutQuad(
            clamp((knifeTimer - knifeMoveAction - knifeSwayAction) / (1 - knifeMoveAction - knifeSwayAction)),
        );
        const knifePosition = lerpPositions(subtimer, ...lastPosition, ...knifePositionFinal);
        const knifeRotation = lerp(subtimer, lastRotation, knifeRotationFinal);
        return [knifePosition, knifeRotation];
    }
}

export function draw() {
    d.rect(0, 0, w, h, "#112");

    c.timerEnd("intro_fade", () => {
        c.startTimer("cap_rotate", 3000);
        c.startTimer("start_cap_lift", 500);
    });
    c.timerEnd("start_cap_lift", () => {
        c.startTimer("cap_lift", 3000);
        c.startTimer("start_knife", 1500);
    });
    c.timerEnd("start_knife", () => {
        c.startTimer("knife_action", knifeActionDuration);
    });

    if (c.timer("knife_action") > 0) {
        let [knifePosition, knifeRotation] = getKnifePositionAndRotation();
        ctx.save();
        ctx.translate(...knifePosition);
        ctx.rotate(knifeRotation);
        knife.draw(0, 0);
        ctx.restore();
    }
    drawDistyBottle(...distyPosition, easeInOutQuad(c.timer("cap_rotate")), easeInOutQuad(c.timer("cap_lift")));

    // CROSS fade ahahaha get it?
    let fadeTimer = c.timer("intro_fade");
    ctx.globalAlpha = fadeTimer;
    d.rect(0, 0, w, h, "black");
    ctx.globalAlpha = 1;
}

export async function init() {
    c.startTimer("intro_fade", 2000, true);
    await knife.preload();
}
