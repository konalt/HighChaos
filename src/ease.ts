// Easings by Andrey Sitnik and Ivan Solovev
// GNU GPLv3
// I hope this doesn't get me sued

export function easeInQuad(x: number): number {
    return x * x;
}

export function easeOutQuad(x: number): number {
    return 1 - (1 - x) * (1 - x);
}

export function easeInOutQuad(x: number): number {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function easeInCirc(x: number): number {
    return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

export function easeOutCirc(x: number): number {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

export function easeInOutCirc(x: number): number {
    return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}
