import { ctx, d, font } from "../engine";
import * as shine from "../gradients/shine";
import { FourNums } from "../utils";

const neckWidth = 30;
const baseWidth = 45;
const dullSideWidth = 0;
const dullSideExtraWidth = 5;
const sharpSideWidth = 20;
const handleLength = 250;
const bladeLength = 320;

const dullBezier = 0.6;
const bladeTip = 0.1;
const neckDullCP = 0.2;
const dullTipCP = 0.8;
const pointCP = 0.5;
const neckWidthModifier = 0.8;

const totalHeight = bladeLength * (1 + pointCP) + handleLength;
const gradientStart = "#c0c0c0ff";
const gradientPreNeck = "#b9b9b9ff";
const gradientNeck = "#0a0a0aff";
const gradientPostNeck = "#686868ff";
const gradientEnd = "#a1a1a1ff";
const gradientNeckOffset = (bladeLength * (1 + pointCP)) / totalHeight - 0.01;
const gradientNeckStartOffset = gradientNeckOffset - 0.05;
const gradientNeckEndOffset = gradientNeckOffset + 0.05;

function addColorStops(gradient: CanvasGradient) {
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(gradientNeckStartOffset, gradientPreNeck);
    gradient.addColorStop(gradientNeckOffset, gradientNeck);
    gradient.addColorStop(gradientNeckEndOffset, gradientPostNeck);
    gradient.addColorStop(1, gradientEnd);
}

export function drawKnife(x: number, y: number, disty = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1); // i wrote it wrong and i dont want to fix it
    const gradCoords: FourNums = [0, -bladeLength * (1 + pointCP), 0, handleLength];
    const gradient = ctx.createLinearGradient(...gradCoords);
    addColorStops(gradient);
    const shineGradient = shine.linear(...gradCoords, 0.3);
    const path = () => {
        ctx.beginPath();
        ctx.moveTo((-neckWidth / 2) * neckWidthModifier, 0);
        ctx.bezierCurveTo(
            -neckWidth / 2,
            -neckDullCP * (bladeLength * dullBezier),
            -neckWidth / 2 - dullSideWidth - dullSideExtraWidth,
            -neckDullCP * (bladeLength * dullBezier),
            -neckWidth / 2 - dullSideWidth - dullSideExtraWidth,
            -bladeLength * dullBezier
        );
        ctx.bezierCurveTo(
            -neckWidth / 2 - dullSideWidth - dullSideExtraWidth,
            -bladeLength * dullBezier - dullTipCP * (bladeLength * (1 - dullBezier)),
            -neckWidth / 2 - dullSideWidth,
            -bladeLength * dullBezier - dullTipCP * (bladeLength * (1 - dullBezier)),
            -neckWidth / 2 - dullSideWidth,
            -bladeLength + 20
        );
        ctx.bezierCurveTo(
            10,
            -(bladeLength * (1 + pointCP)),
            neckWidth / 2 + sharpSideWidth + 20,
            -bladeLength * bladeTip,
            neckWidth / 2 + sharpSideWidth,
            -bladeLength * bladeTip
        );
        ctx.bezierCurveTo(
            neckWidth / 2 + sharpSideWidth,
            -bladeLength * bladeTip,
            neckWidth / 2 + sharpSideWidth - 20,
            -bladeLength * bladeTip,
            (neckWidth / 2) * neckWidthModifier,
            0
        );
        ctx.bezierCurveTo(neckWidth / 2, 30, baseWidth / 2, handleLength - 30, baseWidth / 2, handleLength);
        ctx.bezierCurveTo(
            baseWidth / 2,
            handleLength + 10,
            -baseWidth / 2,
            handleLength + 10,
            -baseWidth / 2,
            handleLength
        );
        ctx.bezierCurveTo(
            -baseWidth / 2,
            handleLength - 30,
            -neckWidth / 2,
            30,
            (-neckWidth / 2) * neckWidthModifier,
            0
        );
        ctx.closePath();
    };
    path();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.fillStyle = shineGradient;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
}
