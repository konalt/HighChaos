import {
    ctx,
    CursorMode,
    d,
    getKeyDown,
    getMouse,
    h,
    loadImage,
    setCursorMode,
    setGlobalVolume,
} from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { basicPointInRect, FourNums } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";

const scale = 0.3;
const size = 400 * scale;
const rect: FourNums = [0, h - size, size, size];

export class MuteButton extends GameObject {
    private _mutedImg: HTMLImageElement;
    private _unmutedImg: HTMLImageElement;
    private _muted = false;

    constructor() {
        super();

        this._mutedImg = NULLTEXTURE;
        this._unmutedImg = NULLTEXTURE;
    }

    draw() {
        let i = this._muted ? this._mutedImg : this._unmutedImg;
        d.rect(...rect, "rgba(0,0,0,0.5)");
        ctx.drawImage(i, ...rect);
    }

    update() {
        if (basicPointInRect(...getMouse(), ...rect)) {
            setCursorMode(CursorMode.Click);
            if (getKeyDown("mouse1")) {
                if (this._muted) {
                    setGlobalVolume(0.8);
                } else {
                    setGlobalVolume(0);
                }
                this._muted = !this._muted;
            }
        }
    }

    async load() {
        [this._mutedImg, this._unmutedImg] = await Promise.all([
            loadImage("santa/audiomute.png"),
            loadImage("santa/audiounmute.png"),
        ]);
    }
}
