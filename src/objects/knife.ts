import { canvas, CanvasStyle, ctx, d, getCanvasImage, useCanvas } from "../engine";
import * as shine from "../gradients/shine";
import { settings } from "../options";
import { FourNums } from "../utils";

const neckWidth = 30;
const baseWidth = 45;
const dullSideWidth = 0;
const dullSideExtraWidth = 5;
const sharpSideWidth = 20;
const handleLength = 250;
const bladeLength = 320;
const bladeTipOffset = 10;

const dullBezier = 0.6;
const bladeTip = 0.1;
const neckDullCP = 0.2;
const dullTipCP = 0.8;
const pointCP = 0.5;
const neckWidthModifier = 0.8;

const realBladeLength = bladeLength * (1 + pointCP * 0.25);
const totalHeight = realBladeLength + handleLength;
const gradientStart = "#c0c0c0ff";
const gradientPreNeck = "#b9b9b9ff";
const gradientNeck = "#575757ff";
const gradientPostNeck = "#888888ff";
const gradientEnd = "#a1a1a1ff";
const gradientNeckOffset = realBladeLength / totalHeight - 0.03;
const gradientNeckStartOffset = gradientNeckOffset - 0.03;
const gradientNeckEndOffset = gradientNeckOffset + 0.05;

function addColorStops(gradient: CanvasStyle) {
    if (!(gradient instanceof CanvasGradient)) return;
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(gradientNeckStartOffset, gradientPreNeck);
    gradient.addColorStop(gradientNeckOffset, gradientNeck);
    gradient.addColorStop(gradientNeckEndOffset, gradientPostNeck);
    gradient.addColorStop(1, gradientEnd);
}

async function getKnifeImage() {
    useCanvas(1);
    canvas.width = 100;
    canvas.height = totalHeight + 10;
    ctx.save();
    ctx.translate(canvas.width / 2, realBladeLength);
    ctx.scale(-1, 1); // i wrote it wrong and i dont want to fix it
    const gradCoords: FourNums = [0, -realBladeLength, 0, handleLength];
    const gradient: CanvasStyle = settings.gradients ? ctx.createLinearGradient(...gradCoords) : gradientPostNeck;
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
            bladeTipOffset,
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
    useCanvas(0);
    return getCanvasImage(1);
}

let cachedKnife: HTMLImageElement;

export async function preload() {
    cachedKnife = await getKnifeImage();
}

export function draw(x: number, y: number) {
    if (cachedKnife) {
        d.quickImage(cachedKnife, x, y);
    }
}
