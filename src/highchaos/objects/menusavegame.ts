import * as cutscene_intro from "../cutscenes/cutscene_intro";
import { easeInOutCirc } from "../../lib/engine/ease";
import { ctx, CursorMode, d, font, getKeyDown, getMouse, setCursorMode, startTimer } from "../../lib/engine/engine";
import { Save, setCurrentSave } from "../../lib/engine/saves";
import { fadeToScene } from "../../lib/engine/engine";
import { basicPointInRect, clamp } from "../../lib/engine/utils";

let hovers = [];

const BoxWidth = 550;
const BoxHeight = 800;
const BaseTailLength = 80;
const DynamicTailLengthX = 300;
const DynamicTailLengthY = 300;

const HoverAnimRate = 0.075;
const BaseAlpha = 0.6;
const DeltaAlpha = 1 - BaseAlpha;

function click(save: Save) {
    if (save.empty) {
        //fadeToScene(cutscene_intro);
    }
}

export function think(x: number, y: number, index = 0, save: Save) {
    if (!hovers[index]) hovers[index] = 0;
    ctx.save();
    ctx.translate(x - BoxWidth / 2, y - BoxHeight / 2);

    let isHovered = basicPointInRect(...getMouse(), 0, 0, BoxWidth, BoxHeight);
    if (isHovered) {
        setCursorMode(CursorMode.Click);
        if (getKeyDown("mouse1")) {
            setCurrentSave(index);
            click(save);
        }
        hovers[index] += HoverAnimRate;
    } else {
        hovers[index] -= HoverAnimRate;
    }
    hovers[index] = clamp(hovers[index]);

    ctx.restore();
}

export function draw(x: number, y: number, index = 0, alphaOverride = 1, save: Save) {
    ctx.save();
    ctx.translate(x - BoxWidth / 2, y - BoxHeight / 2);

    let anim = easeInOutCirc(hovers[index]);

    const tailWidth = BaseTailLength + DynamicTailLengthX * anim;
    const tailHeight = BaseTailLength + DynamicTailLengthY * anim;

    ctx.globalAlpha = (BaseAlpha + hovers[index] * DeltaAlpha) * alphaOverride;

    d.rect(0, 0, BoxWidth, BoxHeight, `rgba(0,0,0,0.7)`);

    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(0, tailHeight);
    ctx.lineTo(0, 0);
    ctx.lineTo(tailWidth, 0);
    ctx.moveTo(BoxWidth, BoxHeight - tailHeight);
    ctx.lineTo(BoxWidth, BoxHeight);
    ctx.lineTo(BoxWidth - tailWidth, BoxHeight);
    ctx.stroke();

    if (save.empty) {
        ctx.textBaseline = "bottom";
        d.text(BoxWidth / 2, BoxHeight / 2, "New\nGame", "white", font(96), "center");
    }

    ctx.globalAlpha = 1 * alphaOverride;

    ctx.restore();
}
