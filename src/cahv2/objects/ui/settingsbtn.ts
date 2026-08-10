import { addToAtlas, ctx, debugMode, deltaTime, font, h, w } from "../../../lib/engine/engine";
import { lerp } from "../../../lib/engine/utils";
import { Clickable } from "../../../lib/ui/clickable";

const Height = 100;
const Margin = 15;
const GearPadding = 5;
const Padding = 10;
const FontSize = 40;
const Gap = 10;
const GearSpinSpeed = 4;

export class CAHSettingsButton extends Clickable {
    private _gearPath: Path2D;
    private _textImg: ImageBitmap;

    private _gearAngle = 0;

    constructor() {
        super();

        this.hoverAnimationSpeed = 0.14;

        this.x = w - Margin - Height;
        this.y = h - Margin - Height;

        this._gearPath = this._createGear();
        this._textImg = this._createText("Settings");
    }

    private _createText(t: string) {
        const canvas = new OffscreenCanvas(512, 128);
        const ctx = canvas.getContext("2d");

        if (!ctx) throw new Error(":3");

        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = font(FontSize);

        const measure = ctx.measureText(t);

        canvas.width = measure.width + 10;
        canvas.height = measure.actualBoundingBoxDescent + 10;

        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = font(FontSize);

        ctx.fillStyle = "white";
        ctx.fillText(t, 5, 5);

        const img = canvas.transferToImageBitmap();
        addToAtlas(img);
        return img;
    }

    private _createGear() {
        // gear properties
        const Major = Height / 2 - GearPadding - Padding;
        const Minor = Major * 0.75;
        const Hole = Major * 0.45;
        const Teeth = 8;
        const SlopeSize = 0.1;

        const ToothSize = (Math.PI * 2) / Teeth;

        const p = new Path2D();

        let theta = -ToothSize / 4;
        p.moveTo(Math.cos(theta) * Major, Math.sin(theta) * Major);

        for (let i = 0; i < Teeth; i++) {
            p.arc(0, 0, Major, theta, theta + ToothSize / 2 - SlopeSize);
            p.arc(0, 0, Minor, theta + ToothSize / 2 + SlopeSize, theta + ToothSize - SlopeSize * 2);
            theta += ToothSize;
        }

        p.moveTo(Hole, 0);
        p.arc(0, 0, Hole, 0, Math.PI * 2);

        return p;
    }

    init(): void {
        this.setBoundingBox([this.x, this.y, Height, Height]);
    }

    update(): void {
        super.update();

        this.setBoundingBox([
            this.x - this.hoverTransition * (this._textImg.width + Gap),
            this.y,
            Height + this.hoverTransition * (this._textImg.width + Gap),
            Height,
        ]);

        if (this.hovered) {
            this._gearAngle += deltaTime * GearSpinSpeed;
        }
    }

    draw() {
        ctx.save();

        ctx.translate(this.x + Height / 2, this.y + Height / 2);

        ctx.fillStyle = `rgba(114, 114, 114, ${lerp(this.hoverTransition, 0.3, 0.75)})`;
        ctx.strokeStyle = "#999999";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
            -Height / 2 - this.hoverTransition * (this._textImg.width + Gap),
            -Height / 2,
            Height + this.hoverTransition * (this._textImg.width + Gap),
            Height,
            5,
        );
        ctx.fill();
        ctx.stroke();

        if (this.hoverTransition > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(
                -Height / 2 - this.hoverTransition * (this._textImg.width + Gap) + Padding,
                -Height / 2 + Padding,
                this.hoverTransition * (this._textImg.width + Gap),
                Height - Padding * 2,
            );
            if (debugMode) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            ctx.clip();
            ctx.drawImage(
                this._textImg,
                -Height / 2 - (this._textImg.width + Gap) + Padding,
                -this._textImg.height / 2,
            );
            ctx.restore();
        }

        ctx.rotate(this._gearAngle);

        ctx.fillStyle = "white";
        ctx.fill(this._gearPath, "evenodd");

        ctx.restore();
    }
}
