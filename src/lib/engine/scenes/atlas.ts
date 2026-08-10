import { Axis, ctx, d, deltaTime, getAxis, getKey, getKeyDown, getMouse, h, images, w } from "../engine";
import { Scene } from "../scene";
import { TwoNums } from "../utils";

const margin = 30;
const cameraSpeed = 200;

export class DebugAtlas extends Scene {
    private _lastClick: TwoNums = [0, 0];
    private _lastCam: TwoNums = [0, 0];

    constructor() {
        super();
    }

    update() {
        if (getKeyDown("mouse1")) {
            this._lastClick = getMouse();
            this._lastCam = [this.camera.x, this.camera.y];
        }

        if (getKey("mouse1")) {
            let mouse = getMouse();
            this.camera.x = this._lastCam[0] - (mouse[0] - this._lastClick[0]);
            this.camera.y = this._lastCam[1] - (mouse[1] - this._lastClick[1]);
        }

        if (getKeyDown("mwheeldown")) this.camera.zoom /= 1.1;
        if (getKeyDown("mwheelup")) this.camera.zoom *= 1.1;
    }

    draw() {
        d.rect(0, 0, w, h, "#111");
        ctx.save();
        this.camera.transform();

        ctx.textBaseline = "bottom";
        ctx.font = "24px monospace";

        let cx = 0;
        let cy = 0;
        let maxHeight = 0;

        for (const [key, img] of images) {
            d.rect(cx, cy, img.width, img.height, "magenta");
            ctx.drawImage(img, cx, cy);
            d.text(cx, cy, key, "white", ctx.font, "left");

            if (img.height > maxHeight) maxHeight = img.height;

            cx += img.width + margin;
            if (cx > w * 2) {
                cx = 0;
                cy += maxHeight + margin;
                maxHeight = 0;
            }
        }
    }
}
