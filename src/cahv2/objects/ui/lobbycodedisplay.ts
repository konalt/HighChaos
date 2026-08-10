import { addToAtlas, ctx, font, wrap } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { COLOR } from "../../color";

const Width = 1000;
const Height = 300;
const Round = 20;
const Padding = 20;

const SmallFontSize = 40;
const BigFontSize = 180;

export class CAHLobbyCodeDisplay extends GameObject {
    private _img: ImageBitmap;

    constructor() {
        super();

        this._img = this._render();
    }

    private _render() {
        const canvas = new OffscreenCanvas(Width, Height);
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error(":3");

        // draw my life
        ctx.fillStyle = COLOR.elementFill;
        ctx.roundRect(0, 0, Width, Height, Round);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = font(SmallFontSize);
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const text = "Welcome to Cards against Humanity!\nYour game code is:";
        const wrapped = wrap(text, Width, ctx.font);

        let cy = Padding;
        for (const line of wrapped) {
            ctx.fillText(line, Width / 2, cy);
            cy += ctx.measureText(line).fontBoundingBoxDescent;
        }

        cy += 10;
        ctx.font = `bold ${BigFontSize}px monospace`;
        ctx.fillText(this._code, Width / 2, cy);
        cy += ctx.measureText(this._code).fontBoundingBoxDescent;

        const img = canvas.transferToImageBitmap();
        addToAtlas(img);
        return img;
    }

    draw() {
        ctx.drawImage(this._img, this.x - Width / 2, this.y - Height / 2);
    }

    private _code: string = "XXXXXX";

    set code(c: string) {
        this._code = c;
        this._img = this._render();
    }

    get code() {
        return this._code;
    }
}
