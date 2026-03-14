import { d, globalTimer, h, w } from "../../lib/engine/engine";

let snows = [];

const gravity = 1;
const swayDistance = 20;
const swaySpeed = 2 * 0.0001;
const snowCount = 300;

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

export function draw(foreground: boolean) {
    let i = 0;
    for (const snow of snows) {
        const depth = snow.depth;
        if (depth < 0.5 == foreground) {
            i++;
            continue;
        }
        const sway = Math.cos(snow.swayOffset * Math.PI + globalTimer * swaySpeed) * swayDistance;
        snow.y += gravity * (depth * 0.5 + 0.5);
        d.circ(snow.x + sway, snow.y, 1 + depth * 3, `rgba(255,255,255,${depth * 0.4 + 0.6})`);
        if (snow.y > h + 15) snows[i] = createSnow(true);
        i++;
    }
}

export function init() {
    snows = [];
    for (let i = 0; i < snowCount; i++) {
        snows.push(createSnow(false));
    }
}
