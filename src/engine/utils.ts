import { ctx } from "./engine";

export type Anchor = "tl" | "tc" | "tr" | "cl" | "cc" | "cr" | "bl" | "bc" | "br";
export type TwoNums = [number, number]; // we have fun here
export type ThreeNums = [number, number, number];
export type FourNums = [number, number, number, number];
export type Scene = { draw: () => void; init: () => Promise<void> };

export function anchorToCoords(anchor: Anchor, x: number, y: number, w: number, h: number) {
    let bx = 0;
    let by = 0;
    const locationY = anchor[0];
    const locationX = anchor[1];
    switch (locationX) {
        case "l":
            bx = x;
            break;
        case "c":
            bx = x - w / 2;
            break;
        case "r":
            bx = x - w;
            break;
    }
    switch (locationY) {
        case "t":
            by = y;
            break;
        case "c":
            by = y - h / 2;
            break;
        case "b":
            by = y - h;
            break;
    }
    return [bx, by];
}

export function grey(fraction: number) {
    let val = fraction * 255;
    return `rgb(${val}, ${val}, ${val})`;
}

export function valueInRange(val: number, min: number, max: number) {
    return val >= min && val <= max;
}
export function basicPointInRect(px: number, py: number, x: number, y: number, w: number, h: number) {
    return valueInRange(px, x, x + w) && valueInRange(py, y, y + h);
}

export function degToRad(degrees: number) {
    return degrees * (Math.PI / 180);
}

export function radToDeg(degrees: number) {
    return (degrees / 180) * Math.PI;
}

export function clamp(x: number, min = 0, max = 1) {
    return Math.min(Math.max(x, min), max);
}

export function lerp(x: number, a: number, b: number) {
    return a + (b - a) * x;
}

export function lerpPositions(v: number, x1: number, y1: number, x2: number, y2: number): TwoNums {
    return [lerp(v, x1, x2), lerp(v, y1, y2)];
}

export function isUpperCase(str: string) {
    return str.toUpperCase() == str;
}

export function sample<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export function alpha(n = 1, set = true) {
    if (n <= 0) return false;
    if (set) ctx.globalAlpha = n;
    return true;
}
