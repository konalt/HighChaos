import { MenuFont } from "../constants";
import { easeInOutCirc, easeInOutQuad, easeOutCirc } from "../ease";
import * as c from "../engine";
import { ctx, d } from "../engine";
import { basicPointInRect, clamp, FourNums } from "../utils";
import * as hhctail from "../objects/hhctail";

const FontSize = 80;
const MarginX = 10;
const MarginY = 14;
const UnderlineThickness = 4;
const LineAnimSpeed = 0.1;

const BaseAlpha = 0.6;
const DeltaAlpha = 1 - BaseAlpha;

let hovers = {};

export function draw(x: number, y: number, text: string = "Button", onClick = () => {}) {
    if (!hovers[text]) hovers[text] = 0;

    c.setFont(MenuFont);
    ctx.font = c.font(FontSize);
    ctx.textBaseline = "middle";

    const measure = ctx.measureText(text);
    const textHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + MarginY * 2;
    const rect: FourNums = [x - MarginX, y - textHeight / 2, measure.width + MarginX * 2, textHeight];

    const isHovering = basicPointInRect(...c.getMouse(), ...rect);
    if (isHovering) {
        c.setCursorMode(c.CursorMode.Click);
        hovers[text] += LineAnimSpeed;
    } else {
        hovers[text] -= LineAnimSpeed;
    }
    hovers[text] = clamp(hovers[text]);

    ctx.globalAlpha = BaseAlpha + hovers[text] * DeltaAlpha;

    d.text(x, y, text, "white", c.font(FontSize), "left");

    if (hovers[text] > 0) {
        const underlineY = y + textHeight / 2;
        hhctail.draw(x, underlineY, easeInOutQuad(hovers[text]) * measure.width, true, 0.5);
        /* ctx.lineWidth = UnderlineThickness;
        ctx.lineCap = "round";
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(x, underlineY);
        ctx.lineTo(x + measure.width * easeInOutQuad(hovers[text]), underlineY);
        ctx.stroke(); */
    }
    ctx.globalAlpha = 1;
}
