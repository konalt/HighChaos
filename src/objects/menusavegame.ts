import { easeInOutCirc } from "../ease";
import { ctx, CursorMode, d, getMouse, setCursorMode } from "../engine";
import { basicPointInRect, clamp } from "../utils";
import * as hhctail from "./hhctail";

let hovers = [];

const BoxWidth = 550;
const BoxHeight = 800;
const BaseTailLength = 2;
const DynamicTailLengthX = 10;
const DynamicTailLengthY = 16;

const HoverAnimRate = 0.1;
const BaseAlpha = 0.6;
const DeltaAlpha = 1 - BaseAlpha;

export function think(x: number, y: number, index = 0) {
    if (!hovers[index]) hovers[index] = 0;
    ctx.save();
    ctx.translate(x - BoxWidth / 2, y - BoxHeight / 2);

    let isHovered = basicPointInRect(...getMouse(), 0, 0, BoxWidth, BoxHeight);
    if (isHovered) {
        setCursorMode(CursorMode.Click);
        hovers[index] += HoverAnimRate;
    } else {
        hovers[index] -= HoverAnimRate;
    }
    hovers[index] = clamp(hovers[index]);

    ctx.restore();
}

export function draw(x: number, y: number, index = 0, alphaOverride = 1) {
    ctx.save();
    ctx.translate(x - BoxWidth / 2, y - BoxHeight / 2);

    //d.rect(0, 0, BoxWidth, BoxHeight, "rgba(0,0,0,0.8)", "red", 5);

    let anim = easeInOutCirc(hovers[index]);

    const tailWidth = BaseTailLength + DynamicTailLengthX * anim;
    const tailHeight = BaseTailLength + DynamicTailLengthY * anim;

    ctx.globalAlpha = (BaseAlpha + anim * DeltaAlpha) * alphaOverride;

    ctx.save();
    ctx.scale(1, -1);
    hhctail.draw(0, 0, tailWidth, false, 0.8);
    ctx.scale(1, -1);
    ctx.rotate(Math.PI / 2);
    hhctail.draw(0, 0, tailHeight, false, 0.8);
    ctx.restore();

    ctx.save();
    ctx.translate(BoxWidth, BoxHeight);
    ctx.scale(-1, 1);
    hhctail.draw(0, 0, tailWidth, false, 0.8);
    ctx.scale(1, -1);
    ctx.rotate(Math.PI / 2);
    hhctail.draw(0, 0, tailHeight, false, 0.8);
    ctx.restore();

    ctx.globalAlpha = 1 * alphaOverride;

    ctx.restore();
}
