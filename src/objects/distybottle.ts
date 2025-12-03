import { ctx, globalTimer } from "../engine";
import * as metallic from "../gradients/metallic";
import * as plastic_glossy from "../gradients/plastic_glossy";

const capWidth = 200;
const capHeight = 130;
const capBottomWidth = 225;
const capBottomHeight = 32;
const bottleWidth = 230;
const bottleHeight = 380;
const bottleNeck = 25;
const bottleNeckHeight = 50;
const strokeThickness = 5;
const round = 20;

const shadowDarkness = 0.5;

function capTop(rotate = 0) {
    const gradient = plastic_glossy.linear(-capWidth / 2, 0, capWidth / 2, 0);
    ctx.beginPath();
    ctx.moveTo(-capWidth / 2 + round, 0);
    ctx.lineTo(capWidth / 2 - round, 0);
    ctx.arc(capWidth / 2 - round, round, round, -Math.PI * 0.5, 0);
    ctx.lineTo(capWidth / 2, capHeight - capBottomHeight / 2);
    ctx.lineTo(-capWidth / 2, capHeight - capBottomHeight / 2);
    ctx.lineTo(-capWidth / 2, round);
    ctx.arc(-capWidth / 2 + round, round, round, Math.PI, Math.PI * 1.5);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "black";
    ctx.lineWidth = strokeThickness;
    ctx.lineJoin = "round";
    ctx.fill();
    ctx.stroke();
}

function capBottom() {
    const gradient = plastic_glossy.linear(-capBottomWidth / 2, 0, capBottomWidth / 2, 0);
    ctx.beginPath();
    ctx.moveTo(-capBottomWidth / 2, capHeight - capBottomHeight);
    ctx.lineTo(capBottomWidth / 2, capHeight - capBottomHeight);
    ctx.lineTo(capBottomWidth / 2, capHeight);
    ctx.lineTo(-capBottomWidth / 2, capHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.strokeStyle = "black";
    ctx.lineWidth = strokeThickness;
    ctx.lineJoin = "round";
    ctx.fill();
    ctx.stroke();
}

function bottle() {
    const gradient = metallic.linear(-bottleWidth / 2, 0, bottleWidth / 2, 0);
    const shadowGradient = ctx.createLinearGradient(0, capHeight, 0, capHeight + bottleHeight);
    shadowGradient.addColorStop(0, `rgba(0,0,0,${shadowDarkness})`);
    shadowGradient.addColorStop(bottleNeckHeight / bottleHeight, "transparent");
    shadowGradient.addColorStop((bottleHeight - round) / bottleHeight, "transparent");
    shadowGradient.addColorStop(1, `rgba(0,0,0,${shadowDarkness})`);
    ctx.beginPath();
    ctx.moveTo(-bottleWidth / 2 + bottleNeck, capHeight);
    ctx.lineTo(bottleWidth / 2 - bottleNeck, capHeight);
    ctx.bezierCurveTo(
        bottleWidth / 2 - bottleNeck,
        capHeight + bottleNeckHeight * 0.5,
        bottleWidth / 2,
        capHeight + bottleNeckHeight * 0.5,
        bottleWidth / 2,
        capHeight + bottleNeckHeight
    );
    ctx.lineTo(bottleWidth / 2, capHeight + bottleHeight - round);
    ctx.arc(bottleWidth / 2 - round, capHeight + bottleHeight - round, round, 0, Math.PI * 0.5);
    ctx.lineTo(-bottleWidth / 2 + round, capHeight + bottleHeight);
    ctx.arc(-bottleWidth / 2 + round, capHeight + bottleHeight - round, round, Math.PI * 0.5, Math.PI);
    ctx.lineTo(-bottleWidth / 2, capHeight + bottleNeckHeight);
    ctx.bezierCurveTo(
        -bottleWidth / 2,
        capHeight + bottleNeckHeight * 0.5,
        -bottleWidth / 2 + bottleNeck,
        capHeight + bottleNeckHeight * 0.5,
        -bottleWidth / 2 + bottleNeck,
        capHeight
    );
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = strokeThickness;
    ctx.lineJoin = "round";
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.fillStyle = shadowGradient;
    ctx.fill();
    ctx.stroke();
}

export function drawDistyBottle(x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    bottle();
    capTop(globalTimer);
    capBottom();
    ctx.restore();
}
