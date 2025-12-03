import { ctx } from "../engine";

const capWidth = 205;
const capHeight = 120;
const bottleWidth = 230;
const bottleHeight = 380;
const bottleNeck = 25;
const bottleNeckHeight = 50;
const strokeThickness = 5;
const round = 20;

function cap() {
    ctx.beginPath();
    ctx.moveTo(-capWidth / 2 + round, 0);
    ctx.lineTo(capWidth / 2 - round, 0);
    ctx.arc(capWidth / 2 - round, round, round, -Math.PI * 0.5, 0);
    ctx.lineTo(capWidth / 2, capHeight);
    ctx.lineTo(-capWidth / 2, capHeight);
    ctx.lineTo(-capWidth / 2, round);
    ctx.arc(-capWidth / 2 + round, round, round, Math.PI, Math.PI * 1.5);
    ctx.closePath();
    ctx.fillStyle = "lime";
    ctx.strokeStyle = "black";
    ctx.lineWidth = strokeThickness;
    ctx.lineJoin = "round";
    ctx.fill();
    ctx.stroke();
}

function bottle() {
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
    ctx.fillStyle = "red";
    ctx.strokeStyle = "black";
    ctx.lineWidth = strokeThickness;
    ctx.lineJoin = "round";
    ctx.fill();
    ctx.stroke();
}

export function drawDistyBottle(x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    bottle();
    cap();
    ctx.restore();
}
