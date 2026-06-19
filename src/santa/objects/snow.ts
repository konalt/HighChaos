import { d, globalTimer, h, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";

const gravity = 1;
const swayDistance = 20;
const swaySpeed = 2 * 0.0001;
const snowCount = 150;

interface Snow {
    x: number;
    y: number;
    depth: number;
    swayOffset: number;
}

function createSnow(atTop: boolean): Snow {
    return {
        x: Math.random() * w,
        y: atTop ? -20 : Math.random() * h,
        depth: Math.random(),
        swayOffset: Math.random(),
    };
}

export class SnowDisplay extends GameObject {
    private _snows: Snow[] = [];
    private _foreground: boolean;

    constructor(foreground: boolean) {
        super();

        this._foreground = foreground;
    }

    draw() {
        // Drawing code goes here
        let i = 0;
        for (const snow of this._snows) {
            const depth = snow.depth / 2 + (this._foreground ? 0.5 : 0);
            const sway = Math.cos(snow.swayOffset * Math.PI + globalTimer * swaySpeed) * swayDistance;
            snow.y += gravity * (depth * 0.5 + 0.5);
            d.circ(snow.x + sway, snow.y, 1 + depth * 3, `rgba(255,255,255,${depth * 0.4 + 0.6})`);
            if (snow.y > h + 15) this._snows[i] = createSnow(true);
            i++;
        }
    }

    init() {
        this._snows = [];
        for (let i = 0; i < snowCount; i++) {
            this._snows.push(createSnow(false));
        }
    }
}
