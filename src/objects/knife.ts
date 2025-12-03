import { ctx, d, font } from "../engine";
import * as metallic from "../gradients/metallic";

const neckWidth = 40;
const baseWidth = 45;
const dullSideWidth = 10;
const dullSideExtraWidth = 5;
const sharpSideWidth = 10;
const handleLength = 200;
const bladeLength = 320;

const dullBezier = 0.5;
const bladeTip = 0.2;
const neckDullCP = 0.5;
const dullTipCP = 0.8;
const pointCP = 0.2;

export function drawKnife(x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    /* const path = () => {
        ctx.beginPath();
        ctx.moveTo(-neckWidth / 2, 0);
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
            -15,
            -(bladeLength * (1 + pointCP)),
            neckWidth / 2 + sharpSideWidth,
            -bladeLength * bladeTip,
            neckWidth / 2 + sharpSideWidth,
            -bladeLength * bladeTip
        );
        //ctx.lineTo(200, -200);
        ctx.closePath();
    };
    path(); */
    // TODO make a knife
    d.rect(
        0,
        0,
        neckWidth,
        handleLength + bladeLength,
        metallic.linear(-neckWidth / 2, 0, neckWidth / 2, 0),
        "transparent",
        0,
        "cc"
    );
    d.text(0, 0, "knife", "blue", font(24), "center", neckWidth);
    d.text(0, -bladeLength / 2, "blade", "blue", font(24), "center", neckWidth);
    ctx.restore();
}
