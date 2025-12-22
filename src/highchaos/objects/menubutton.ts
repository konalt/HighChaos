import { MenuFont } from "../constants";
import { easeInOutQuad } from "../../engine/ease";
import * as c from "../../engine/engine";
import { ctx, d } from "../../engine/engine";
import { basicPointInRect, clamp, FourNums } from "../../engine/utils";
import * as hhctail from "../objects/hhctail";

const FontSize = 80;
const MarginX = 10;
const MarginY = 14;
const LineAnimSpeed = 0.1;

const BaseAlpha = 0.6;
const DeltaAlpha = 1 - BaseAlpha;

let hovers = {};
let measures = {};

export function think(x: number, y: number, text: string, onClick = () => {}, lock = false, id = "-") {
    let clicked = false;
    if (id == "-") id = text;
    if (!hovers[id]) hovers[id] = 0;
    if (!lock) {
        if (!measures[text]) {
            c.setFont(MenuFont);
            ctx.font = c.font(FontSize);
            measures[text] = ctx.measureText(text);
        }
        const measure = measures[text];
        const textHeight = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent + MarginY * 2;
        const rect: FourNums = [x - MarginX, y - textHeight / 2, measure.width + MarginX * 2, textHeight];

        const isHovering = basicPointInRect(...c.getMouse(), ...rect);
        if (isHovering) {
            c.setCursorMode(c.CursorMode.Click);
            if (c.getKeyDown("mouse1")) {
                onClick();
                clicked = true;
            }
            hovers[id] += LineAnimSpeed;
        } else {
            hovers[id] -= LineAnimSpeed;
        }
        hovers[id] = clamp(hovers[id]);
    }
    return clicked;
}

export function draw(x: number, y: number, text: string = "Button", alphaOverride = 1, id = "-") {
    if (id == "-") id = text;
    c.setFont(MenuFont);
    ctx.font = c.font(FontSize);
    ctx.textBaseline = "middle";

    if (!measures[text]) measures[text] = ctx.measureText(text);
    const measure = measures[text];
    const textHeight = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent + MarginY * 2;

    ctx.globalAlpha = (BaseAlpha + hovers[id] * DeltaAlpha) * alphaOverride;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(text, x, y);

    if (hovers[id] > 0) {
        const underlineY = y + textHeight * 0.4;
        hhctail.draw(x, underlineY, easeInOutQuad(hovers[id]) * measure.width, true, 0.5);
    }
    ctx.globalAlpha = alphaOverride;
}
