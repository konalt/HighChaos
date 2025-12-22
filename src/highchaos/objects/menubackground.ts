import { w, h, ctx, globalTimer, d } from "../../engine/engine";

const OuterPad = 50;
const GridScale = 100;
const YOffset = 0.6;
const XCount = w / GridScale + 1;
const YCount = h / GridScale + 1;
const BackgroundColor = "#0f200dff";
const LineColor = "#09ff00ff";
const LineWidth = 3;
const Speed = 0.0003;
const Darken = 0.3;

export function draw() {
    let offset = ((globalTimer * Speed) % 1) - 0.5;

    d.rect(0, 0, w, h, BackgroundColor);

    ctx.strokeStyle = LineColor;
    ctx.lineWidth = LineWidth;

    for (let i = 0; i < XCount; i++) {
        let j = i + offset;
        ctx.beginPath();
        ctx.moveTo(j * GridScale, -OuterPad);
        ctx.lineTo(j * GridScale, h + OuterPad);
        ctx.stroke();
    }

    for (let i = 0; i < YCount; i++) {
        let j = i + offset + YOffset;
        ctx.beginPath();
        ctx.moveTo(-OuterPad, j * GridScale);
        ctx.lineTo(w + OuterPad, j * GridScale);
        ctx.stroke();
    }

    ctx.globalAlpha = Darken;
    d.rect(0, 0, w, h, "black");
    ctx.globalAlpha = 1;
}
