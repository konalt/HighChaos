import { log } from "./log";
import { Anchor, anchorToCoords, basicPointInRect, Scene, TwoNums } from "./utils";

let canvasMain: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
let ctxMain: CanvasRenderingContext2D = canvasMain.getContext("2d") as CanvasRenderingContext2D;

let canvases: [HTMLCanvasElement, CanvasRenderingContext2D][] = [[canvasMain, ctxMain]];

let canvas = canvases[0][0];
let ctx = canvases[0][1];

export function getCanvas(id: number) {
    return canvases[id][0];
}

export async function getCanvasImage(id: number) {
    const c = canvases[id][0];
    const url = c.toDataURL();
    const img = new Image();
    return new Promise<HTMLImageElement>((res) => {
        img.addEventListener("load", () => {
            res(img);
        });
        img.src = url;
    });
}

export function useCanvas(id: number) {
    if (!canvases[id]) {
        let cv = document.createElement("canvas");
        let ct = cv.getContext("2d");
        canvases[id] = [cv, ct];
    }
    [canvas, ctx] = canvases[id];
}

export type CanvasStyle = string | CanvasGradient | CanvasPattern;

export { canvas, ctx };

const height = 1080;
let aspect = 16 / 9;
export let w = height * aspect;
export let h = height;
let parent = canvasMain.parentElement as HTMLElement; // i swear to you. it's not null.

let resolutionMultiplier = 1;
export function setResolution(res: number) {
    resolutionMultiplier = res;
    requestAnimationFrame(onResize);
}
export function onResize() {
    let elWidth = 0;
    let elHeight = 0;
    if (parent.clientWidth > parent.clientHeight && parent.clientHeight * aspect <= parent.clientWidth) {
        elWidth = parent.clientHeight * aspect;
        elHeight = parent.clientHeight;
    } else {
        elWidth = parent.clientWidth;
        elHeight = parent.clientWidth / aspect;
    }

    canvasMain.width = elWidth * resolutionMultiplier;
    canvasMain.height = elHeight * resolutionMultiplier;

    canvasMain.style.width = `${elWidth}px`;
    canvasMain.style.height = `${elHeight}px`;

    ctxMain.scale(canvasMain.height / height, canvasMain.height / height);
}

export function sz(size: number) {
    let ret = canvasMain.height * (size / height);
    return ret;
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

function quickImage(image: HTMLImageElement, x: number, y: number, scale: number = 1, anchor: Anchor = "cc"): void {
    if (!ctx) return;
    if (!anchor) anchor = "tl";
    const [w, h] = [image.width * scale, image.height * scale];
    const [bx, by] = anchorToCoords(anchor, x, y, w, h);
    ctx.drawImage(image, bx, by, w, h);
}
//#endregion

//#region shadows
export function setShadow(x: number, y: number, blur: number, color: string) {
    ctx.shadowBlur = sz(blur);
    ctx.shadowColor = color;
    ctx.shadowOffsetX = sz(x); // WHY DOES THIS NOT SCALE PROPERLY???
    ctx.shadowOffsetY = sz(y); // WHAT THE FUCK??
}
export function resetShadow() {
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
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
let mouseX = 0;
let mouseY = 0;
export function getMouse(): TwoNums {
    const transform = ctx.getTransform();
    const p = new DOMPoint(mouseX * resolutionMultiplier, mouseY * resolutionMultiplier);
    const transformed = p.matrixTransform(transform.inverse());
    return [transformed.x, transformed.y];
}
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
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}
function handleMouseUp(event: MouseEvent) {
    if (event.button == 0) {
        justReleased.push("mouse1");
        heldKeys = heldKeys.filter((hk) => hk !== "mouse1");
    } else if (event.button == 2) {
        justReleased.push("mouse2");
        heldKeys = heldKeys.filter((hk) => hk !== "mouse2");
    }
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}
function handleMouseMove(event: MouseEvent) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
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

//#region timers
export let globalTimer = 0;
let timers = {};
export function startTimer(name: string, duration: number, inverse = false) {
    log("timers", `Started timer ${name} with duration ${duration}${inverse ? " (inverse)" : ""}`);
    timers[name] = [globalTimer, duration, inverse];
}
export function timer(name: string, clamp = true) {
    if (!timers[name]) return 0;
    let thisTimer = timers[name];
    let t = (globalTimer - thisTimer[0]) / thisTimer[1];
    if (thisTimer[2]) t = 1 - t;
    if (clamp) t = Math.min(Math.max(t, 0), 1);
    return t;
}
export function timerEnd(name: string, cb = () => {}, remove = true) {
    if (!timers[name]) return;
    let thisTimer = timers[name];
    let ended = globalTimer - thisTimer[0] >= thisTimer[1];
    if (ended) {
        log("timers", `Timer ended: ${name}`);
        cb();
        if (remove) delete timers[name];
    }
    return ended;
}
export function removeTimer(name: string) {
    delete timers[name];
}
//#endregion

//#region cursors
export enum CursorMode {
    Default,
    Click,
    Grab,
    Grabbing,
    ResizeEW,
    ResizeNS,
    ResizeNESW,
    ResizeNWSE,
}
export function setCursorMode(mode: CursorMode) {
    switch (mode) {
        case CursorMode.Default:
            canvas.style.cursor = "default";
            break;
        case CursorMode.Click:
            canvas.style.cursor = "pointer";
            break;
        case CursorMode.Grab:
            canvas.style.cursor = "grab";
            break;
        case CursorMode.Grabbing:
            canvas.style.cursor = "grabbing";
            break;
        case CursorMode.ResizeEW:
            canvas.style.cursor = "ew-resize";
            break;
        case CursorMode.ResizeNS:
            canvas.style.cursor = "ns-resize";
            break;
        case CursorMode.ResizeNESW:
            canvas.style.cursor = "nesw-resize";
            break;
        case CursorMode.ResizeNWSE:
            canvas.style.cursor = "nwse-resize";
            break;
    }
}
//#endregion

//#region Assets
export async function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.src = `assets/img/${url}`;
    });
}
//#endregion

let drawFunction = () => {};
export function setDrawFunction(func: () => void) {
    drawFunction = func;
}

export let deltaTime = 1;
let lastLoop = performance.now();
const fpsc: number[] = [];
const fpscc = 30;
function calculateFPS() {
    const thisLoop = Date.now();
    const fps = 1000 / (thisLoop - lastLoop);
    fpsc.push(fps);
    if (fpsc.length > fpscc) fpsc.shift();
    deltaTime = (thisLoop - lastLoop) / 75;
    lastLoop = thisLoop;
}
export function getFPS() {
    return Math.round(fpsc.reduce((a, b) => a + b, 0) / fpsc.length);
}
function draw() {
    globalTimer = performance.now();
    ctx.save();
    try {
        calculateFPS();
        setCursorMode(CursorMode.Default);
        drawFunction();
        ctx.restore();
    } catch (e) {
        ctx.restore();
        useCanvas(0);
        canvasMain.width = w;
        ctx.textBaseline = "top";
        text(0, 0, e.message, "red", "24px monospace", "left", w);
    }
    justPressed = [];
    justReleased = [];
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
    canvasMain.addEventListener("mousedown", handleMouseDown, {
        capture: true,
    });
    canvasMain.addEventListener("mouseup", handleMouseUp, {
        capture: true,
    });
    canvasMain.addEventListener("mousemove", handleMouseMove, {
        capture: true,
    });
    canvasMain.addEventListener(
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

export function setScene(scene: Scene) {
    scene.init().then(() => {
        setDrawFunction(scene.draw);
    });
}

export const d = {
    rect,
    circ,
    roundRect,
    text,
    button,
    quickImage,
};
