import {
    ctx,
    CursorMode,
    d,
    getKey,
    getKeyDown,
    getMouse,
    h,
    loadImage,
    setCursorMode,
    setGlobalVolume,
} from "../../engine/engine";
import { basicPointInRect, FourNums } from "../../engine/utils";

let mutedImg: HTMLImageElement;
let unmutedImg: HTMLImageElement;

let muted = false;

const scale = 0.3;
const size = 400 * scale;
const rect: FourNums = [0, h - size, size, size];

export function draw() {
    let i = muted ? mutedImg : unmutedImg;
    d.rect(...rect, "rgba(0,0,0,0.5)");
    ctx.drawImage(i, ...rect);
    if (basicPointInRect(...getMouse(), ...rect)) {
        setCursorMode(CursorMode.Click);
        if (getKeyDown("mouse1")) {
            if (muted) {
                setGlobalVolume(0.8);
            } else {
                setGlobalVolume(0);
            }
            muted = !muted;
        }
    }
}

export async function load() {
    [mutedImg, unmutedImg] = await Promise.all([loadImage("santa/audiomute.png"), loadImage("santa/audiounmute.png")]);
}
