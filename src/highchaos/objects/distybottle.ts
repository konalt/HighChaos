import { CanvasStyle, ctx, globalTimer, resetShadow, setShadow } from "../../lib/engine/engine";
import * as metallic from "../gradients/metallic";
import * as plastic_glossy from "../gradients/plastic_glossy";
import { detail, settings } from "../../lib/engine/options";
import { degToRad } from "../../lib/engine/utils";

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
const capTopLines = 7;
const capTopLineFraction = 0.3;
const capTopLiftX = -200;
const capTopLiftY = 400;
const capTopLiftRotate = degToRad(-45);

const shadowDarkness = 0.5;

function capTop(rotate = 0, lift = 0) {
    rotate *= 10;
    rotate %= 1;
    ctx.save();
    ctx.translate(lift * capTopLiftX, -lift * capTopLiftY);
    ctx.rotate(lift * capTopLiftRotate);
    const gradient = plastic_glossy.linear(-capWidth / 2, 0, capWidth / 2, 0);
    const path = () => {
        ctx.beginPath();
        ctx.moveTo(-capWidth / 2 + round, 0);
        ctx.lineTo(capWidth / 2 - round, 0);
        ctx.arc(capWidth / 2 - round, round, round, -Math.PI * 0.5, 0);
        ctx.lineTo(capWidth / 2, capHeight - capBottomHeight / 2);
        ctx.lineTo(-capWidth / 2, capHeight - capBottomHeight / 2);
        ctx.lineTo(-capWidth / 2, round);
        ctx.arc(-capWidth / 2 + round, round, round, Math.PI, Math.PI * 1.5);
        ctx.closePath();
    };
    path();
    ctx.fillStyle = gradient;
    ctx.fill();
    let dx = capWidth / capTopLines;
    let cx = -capWidth / 2 + rotate * dx;
    for (let i = 0; i < capTopLines; i++) {
        if (cx > capWidth / 2) break;
        if (detail(2)) setShadow((-i / capTopLines) * 2 + 1, 0, 3, "#1414149c");
        ctx.beginPath();
        ctx.moveTo(cx, capHeight - capBottomHeight / 2);
        ctx.lineTo(cx, capHeight * capTopLineFraction);
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#ffffffff";
        ctx.stroke();
        cx += dx;
    }
    resetShadow();
    path();
    ctx.strokeStyle = "black";
    ctx.lineWidth = strokeThickness;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
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
    let shadowGradient: CanvasStyle = "transparent";
    if (settings.gradients) {
        shadowGradient = ctx.createLinearGradient(0, capHeight, 0, capHeight + bottleHeight);
        shadowGradient.addColorStop(0, `rgba(0,0,0,${shadowDarkness})`);
        shadowGradient.addColorStop(bottleNeckHeight / bottleHeight, "transparent");
        shadowGradient.addColorStop((bottleHeight - round) / bottleHeight, "transparent");
        shadowGradient.addColorStop(1, `rgba(0,0,0,${shadowDarkness})`);
    }
    ctx.beginPath();
    ctx.moveTo(-bottleWidth / 2 + bottleNeck, capHeight);
    ctx.lineTo(bottleWidth / 2 - bottleNeck, capHeight);
    ctx.bezierCurveTo(
        bottleWidth / 2 - bottleNeck,
        capHeight + bottleNeckHeight * 0.5,
        bottleWidth / 2,
        capHeight + bottleNeckHeight * 0.5,
        bottleWidth / 2,
        capHeight + bottleNeckHeight,
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
        capHeight,
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

export function drawDistyBottle(x: number, y: number, capRotate = 0, capLift = 0) {
    ctx.save();
    ctx.translate(x, y);
    bottle();
    capTop(capRotate, capLift);
    capBottom();
    ctx.restore();
}
