export type Anchor = "tl" | "tc" | "tr" | "cl" | "cc" | "cr" | "bl" | "bc" | "br";

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

function valueInRange(val: number, min: number, max: number) {
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
