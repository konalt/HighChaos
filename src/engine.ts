import { Anchor, anchorToCoords, basicPointInRect } from "./utils";

const canvas: HTMLCanvasElement =
    (document.getElementById("canvas") as HTMLCanvasElement) ?? (document.createElement("canvas") as HTMLCanvasElement);
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

export type CanvasStyle = string | CanvasGradient | CanvasPattern;

export { canvas, ctx };

const height = 1080;
let aspect = 16 / 9;
export let w = height * aspect;
export let h = height;
let parent = canvas.parentElement as HTMLElement; // i swear to you. it's not null.

export function onResize() {
    if (
        parent.clientWidth > parent.clientHeight &&
        (canvas.width = parent.clientHeight * aspect) <= parent.clientWidth
    ) {
        canvas.height = parent.clientHeight;
        canvas.width = parent.clientHeight * aspect;
    } else {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientWidth * (1 / aspect);
    }

    ctx.scale(canvas.height / height, canvas.height / height);
}

const defaultStrokeWidth = 5;

//#region draw functions
function rect(
    x: number,
    y: number,
    w: number,
    h: number,
    fill: CanvasStyle,
    stroke: CanvasStyle = "transparent",
    strokeWidth = 0,
    anchor: Anchor = "tl"
): void {
    if (!ctx) return;
    if (!anchor) anchor = "tl";
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Number.EPSILON;
    if (stroke !== "transparent") {
        if (strokeWidth) {
            ctx.lineWidth = strokeWidth;
        } else {
            ctx.lineWidth = defaultStrokeWidth;
        }
    }
    const [bx, by] = anchorToCoords(anchor, x, y, w, h);
    ctx.fillRect(bx + ctx.lineWidth / 2, by + ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
    if (stroke !== "transparent") {
        ctx.strokeRect(bx + ctx.lineWidth / 2, by + ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
    }
}

function circ(
    x: number,
    y: number,
    r: number,
    fill: CanvasStyle,
    stroke: CanvasStyle = "transparent",
    strokeWidth = Number.EPSILON
): void {
    if (!ctx) return;
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    if (strokeWidth < Number.EPSILON) strokeWidth = Number.EPSILON;
    if (stroke !== "transparent") {
        if (typeof strokeWidth !== undefined) {
            ctx.lineWidth = strokeWidth;
        } else {
            ctx.lineWidth = defaultStrokeWidth;
        }
    } else {
        ctx.lineWidth = Number.EPSILON;
    }
    ctx.beginPath();
    if (r < ctx.lineWidth / 2) {
        ctx.fillStyle = ctx.strokeStyle;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.moveTo(x + r - ctx.lineWidth / 2, y);
        ctx.arc(x, y, r - ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        if (stroke !== "transparent") {
            ctx.stroke();
        }
    }
}

function roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: CanvasStyle,
    stroke: CanvasStyle = "transparent",
    strokeWidth = 0
): void {
    if (!ctx) return;
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    if (stroke !== "transparent") {
        if (strokeWidth) {
            ctx.lineWidth = strokeWidth;
        } else {
            ctx.lineWidth = defaultStrokeWidth;
        }
    }
    ctx.beginPath();
    w -= r;
    h -= r;
    w -= ctx.lineWidth;
    h -= ctx.lineWidth;
    ctx.moveTo(x + ctx.lineWidth / 2 + r, y + ctx.lineWidth / 2);
    ctx.lineTo(x + ctx.lineWidth / 2 + w, y + ctx.lineWidth / 2);
    ctx.arc(x + ctx.lineWidth / 2 + w, y + ctx.lineWidth / 2 + r, r, Math.PI * 1.5, Math.PI * 2.0);
    ctx.lineTo(x + ctx.lineWidth / 2 + w + r, y + ctx.lineWidth / 2 + h);
    ctx.arc(x + ctx.lineWidth / 2 + w, y + ctx.lineWidth / 2 + h, r, Math.PI * 0.0, Math.PI * 0.5);
    ctx.lineTo(x + ctx.lineWidth / 2 + r, y + ctx.lineWidth / 2 + h + r);
    ctx.arc(x + ctx.lineWidth / 2 + r, y + ctx.lineWidth / 2 + h, r, Math.PI * 0.5, Math.PI * 1.0);
    ctx.lineTo(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2 + r);
    ctx.arc(x + ctx.lineWidth / 2 + r, y + ctx.lineWidth / 2 + r, r, Math.PI * 1.0, Math.PI * 1.5);
    ctx.fill();
    if (stroke !== "transparent") {
        ctx.stroke();
    }
}

function text(
    x: number,
    y: number,
    text: string,
    col: CanvasStyle,
    font: string,
    align: CanvasTextAlign,
    maxWidth = 99999,
    outline = 0
) {
    ctx.fillStyle = col;
    ctx.textAlign = align;
    ctx.font = font;
    if (outline > 0) ctx.lineWidth = outline;
    ctx.strokeStyle = "black";
    const lines = text.split("\n");
    const lineheight = ctx.measureText("X").fontBoundingBoxAscent + ctx.measureText("X").fontBoundingBoxDescent;
    let maxLineWidth = 0;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineheight, maxWidth);
        if (outline > 0) ctx.strokeText(lines[i], x, y + i * lineheight, maxWidth);
        const calculatedWidth = Math.min(ctx.measureText(lines[i]).width, maxWidth);
        if (calculatedWidth > maxLineWidth) maxLineWidth = calculatedWidth;
    }
}

function button(
    x: number,
    y: number,
    fontSize: number,
    buttonText: string,
    backgroundColor: CanvasStyle,
    hoverBackgroundColor: CanvasStyle,
    textColor: CanvasStyle,
    mouse: [number, number, boolean],
    onClick: () => void,
    fontName = "sans-serif"
) {
    const buttonPadding = 5;
    ctx.font = `${fontSize}px ${fontName}`;
    const bh = fontSize + buttonPadding * 2;
    const bw = ctx.measureText(buttonText).width + buttonPadding * 2;
    const bx = x - bw / 2;
    const by = y - bh / 2;
    const hovered = basicPointInRect(mouse[0], mouse[1], bx, by, bw, bh);
    roundRect(bx, by, bw, bh, 5, hovered ? hoverBackgroundColor : backgroundColor);
    const otb: CanvasTextBaseline = `${ctx.textBaseline}`;
    ctx.textBaseline = "top";
    text(bx + buttonPadding, by + buttonPadding, buttonText, textColor, ctx.font, "left", bw - buttonPadding);
    ctx.textBaseline = otb;
    if (hovered && mouse[2]) {
        onClick();
    }
}
//#endregion

//#region input shit
let heldKeys: string[] = [];
let justPressed: string[] = [];
let justReleased: string[] = [];
function handleKeyDown(event: KeyboardEvent) {
    const code = event.code.toLowerCase();
    if (event.code != "F5" && event.code != "F12" && event.code != "F11" && !(event.ctrlKey && event.code == "KeyV"))
        event.preventDefault();
    if (event.repeat) return;
    if (!heldKeys.includes(code)) {
        justPressed.push(code);
        heldKeys.push(code);
    }
}
function handleKeyUp(event: KeyboardEvent) {
    const code = event.code.toLowerCase();
    event.preventDefault();
    if (heldKeys.includes(code)) {
        justReleased.push(code);
        heldKeys = heldKeys.filter((hk) => {
            return hk != code;
        });
    }
}
export let mouseX = 0;
export let mouseY = 0;
export function forceKeyDown(code: string) {
    justPressed.push(code);
    heldKeys.push(code);
}
export function forceKeyUp(code: string) {
    justReleased.push(code);
    heldKeys = heldKeys.filter((hk) => hk !== code);
}
function handleMouseDown(event: MouseEvent) {
    if (event.button == 0) {
        justPressed.push("mouse1");
        heldKeys.push("mouse1");
    } else if (event.button == 2) {
        justPressed.push("mouse2");
        heldKeys.push("mouse2");
    }
    mouseX = event.offsetX * (h / canvas.height);
    mouseY = event.offsetY * (h / canvas.height);
}
function handleMouseUp(event: MouseEvent) {
    if (event.button == 0) {
        justReleased.push("mouse1");
        heldKeys = heldKeys.filter((hk) => hk !== "mouse1");
    } else if (event.button == 2) {
        justReleased.push("mouse2");
        heldKeys = heldKeys.filter((hk) => hk !== "mouse2");
    }
    mouseX = event.offsetX * (h / canvas.height);
    mouseY = event.offsetY * (h / canvas.height);
}
function handleMouseMove(event: MouseEvent) {
    mouseX = event.offsetX * (h / canvas.height);
    mouseY = event.offsetY * (h / canvas.height);
}
export function getKey(key: string) {
    return heldKeys.includes(key.toLowerCase());
}
export function getKeyDown(key: string) {
    return justPressed.includes(key.toLowerCase());
}
export function getKeyUp(key: string) {
    return justReleased.includes(key.toLowerCase());
}
export function getKeys() {
    return [...heldKeys];
}
export function getKeysDown() {
    return [...justPressed];
}
export function getKeysUp() {
    return [...justReleased];
}
export enum Axis {
    Horizontal,
    Vertical,
}
export function getAxis(axis: Axis) {
    let value = 0;
    switch (axis) {
        case Axis.Horizontal:
            if (getKey("keya") || getKey("arrowleft")) value--;
            if (getKey("keyd") || getKey("arrowright")) value++;
            break;
        case Axis.Vertical:
            if (getKey("keyw") || getKey("arrowup")) value--;
            if (getKey("keys") || getKey("arrowdown")) value++;
            break;
    }
    return value;
}
//#endregion

//#region font shit
let fontname = "sans-serif";
export function font(size: number, prefix = "") {
    return (prefix.length > 0 ? prefix + " " : "") + size + "px " + fontname;
}
export function setFont(newFont: string) {
    fontname = newFont;
}
//#endregion

export let globalTimer = 0;
let timers = {};
export function startTimer(name: string, duration: number) {
    timers[name] = [globalTimer, duration];
}
export function timer(name: string, clamp = true) {
    if (!timers[name]) {
        console.error(`Unknown timer ${name}`);
        return;
    }
    let thisTimer = timers[name];
    let t = (globalTimer - thisTimer[0]) / thisTimer[1];
    if (clamp) t = Math.min(Math.max(t, 0), 1);
    return t;
}

let drawFunction = () => {};
export function setDrawFunction(func: () => void) {
    drawFunction = func;
}

export let deltaTime = 1;
let lastLoop = performance.now();
function draw() {
    globalTimer = performance.now();
    drawFunction();
    const thisLoop = performance.now();
    deltaTime = thisLoop - lastLoop;
    requestAnimationFrame(draw);
}

export function init() {
    document.addEventListener("keydown", handleKeyDown, {
        capture: true,
    });
    document.addEventListener("keyup", handleKeyUp, {
        capture: true,
    });
    canvas.addEventListener("mousedown", handleMouseDown, {
        capture: true,
    });
    canvas.addEventListener("mouseup", handleMouseUp, {
        capture: true,
    });
    canvas.addEventListener("mousemove", handleMouseMove, {
        capture: true,
    });
    canvas.addEventListener(
        "contextmenu",
        (e) => {
            e.preventDefault();
        },
        { capture: true }
    );
    onResize();
    window.addEventListener("resize", onResize);
    lastLoop = performance.now();
    draw();
}

export const d = {
    rect,
    circ,
    roundRect,
    text,
    button,
};
