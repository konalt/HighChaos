import { ctx, d, h, w } from "../../engine/engine";
import { GradientType, TwoNums } from "../../engine/utils";
import { Background } from "./background";

export class GradientBackground extends Background {
    private _type: GradientType;

    private _colors: string[];
    private _angle: number;
    private _scale: number;

    private _size: number;

    private _needsRefresh: boolean;
    private _gradient: CanvasGradient;

    constructor() {
        super();

        this.type = GradientType.Linear;
        this.colors = ["red", "blue"];
        this.angle = 0;
        this.scale = 1;

        this._refreshGradient();
    }

    private _refreshGradient() {
        this._size = Math.min(w, h);

        const o: TwoNums = [w / 2 + this.x, h / 2 + this.y];

        let grad: CanvasGradient;
        switch (this.type) {
            case GradientType.Linear:
                const c = Math.cos(this.angle);
                const s = Math.sin(this.angle);
                grad = ctx.createLinearGradient(
                    o[0] + ((c * this._size) / 2) * -1,
                    o[1] + ((s * this._size) / 2) * -1,
                    o[0] + (c * this._size) / 2,
                    o[1] + (s * this._size) / 2,
                );
                break;
            case GradientType.Radial:
                grad = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], (this._size / 2) * this._scale);
                break;
            case GradientType.Conic:
                grad = ctx.createConicGradient(this.angle, o[0], o[1]);
                break;
        }

        this._colors.forEach((c, i) => {
            grad.addColorStop(i / (this._colors.length - 1), c);
        });
        this._gradient = grad;

        this._needsRefresh = false;
    }

    update() {
        if (this._needsRefresh) {
            this._refreshGradient();
        }
    }

    draw() {
        const sx = w / this._size;
        const sy = h / this._size;

        ctx.save();
        ctx.translate(w / 2, h / 2);

        ctx.scale(sx, sy);
        ctx.translate(-w / 2, -h / 2);

        d.rect(0, 0, w, h, this._gradient);
        ctx.restore();
    }

    set colors(colors: string[]) {
        this._colors = colors;
        this._needsRefresh = true;
    }

    get colors() {
        return this._colors;
    }

    set type(type: GradientType) {
        this._type = type;
        this._needsRefresh = true;
    }

    get type() {
        return this._type;
    }

    set angle(angle: number) {
        this._angle = angle;
        this._needsRefresh = true;
    }

    get angle() {
        return this._angle;
    }

    set scale(scale: number) {
        this._scale = scale;
        this._needsRefresh = true;
    }

    get scale() {
        return this._scale;
    }
}
