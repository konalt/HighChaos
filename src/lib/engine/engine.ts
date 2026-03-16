import { SceneCamera } from "./camera";
import { FadeDuration } from "./constants";
import { log } from "./log";
import { Scene } from "./scene";
import { Anchor, anchorToCoords, basicPointInRect, TwoNums } from "./utils";

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

    canvasMain.width = Math.floor(elWidth) * resolutionMultiplier;
    canvasMain.height = Math.floor(elHeight) * resolutionMultiplier;

    canvasMain.style.width = `${Math.floor(elWidth)}px`;
    canvasMain.style.height = `${Math.floor(elHeight)}px`;

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
    stroke: CanvasStyle = "",
    strokeWidth = 0,
    anchor: Anchor = "tl",
): void {
    if (!ctx) return;
    if (!anchor) anchor = "tl";
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Number.EPSILON;
    if (stroke !== "") {
        if (strokeWidth) {
            ctx.lineWidth = strokeWidth;
        } else {
            ctx.lineWidth = defaultStrokeWidth;
        }
    }
    const [bx, by] = anchorToCoords(anchor, x, y, w, h);
    ctx.fillRect(bx + ctx.lineWidth / 2, by + ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
    if (stroke !== "") {
        ctx.strokeRect(bx + ctx.lineWidth / 2, by + ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
    }
}

function circ(
    x: number,
    y: number,
    r: number,
    fill: CanvasStyle,
    stroke: CanvasStyle = "transparent",
    strokeWidth = Number.EPSILON,
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
    stroke: CanvasStyle = "",
    strokeWidth = 0,
    anchor: Anchor = "tl",
): void {
    if (!ctx) return;
    if (!anchor) anchor = "tl";
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    if (stroke !== "") {
        if (strokeWidth) {
            ctx.lineWidth = strokeWidth;
        } else {
            ctx.lineWidth = defaultStrokeWidth;
        }
    }
    ctx.beginPath();
    const [bx, by] = anchorToCoords(anchor, x, y, w, h);
    w -= r;
    h -= r;
    w -= ctx.lineWidth;
    h -= ctx.lineWidth;
    ctx.moveTo(bx + ctx.lineWidth / 2 + r, by + ctx.lineWidth / 2);
    ctx.lineTo(bx + ctx.lineWidth / 2 + w, by + ctx.lineWidth / 2);
    ctx.arc(bx + ctx.lineWidth / 2 + w, by + ctx.lineWidth / 2 + r, r, Math.PI * 1.5, Math.PI * 2.0);
    ctx.lineTo(bx + ctx.lineWidth / 2 + w + r, by + ctx.lineWidth / 2 + h);
    ctx.arc(bx + ctx.lineWidth / 2 + w, by + ctx.lineWidth / 2 + h, r, Math.PI * 0.0, Math.PI * 0.5);
    ctx.lineTo(bx + ctx.lineWidth / 2 + r, by + ctx.lineWidth / 2 + h + r);
    ctx.arc(bx + ctx.lineWidth / 2 + r, by + ctx.lineWidth / 2 + h, r, Math.PI * 0.5, Math.PI * 1.0);
    ctx.lineTo(bx + ctx.lineWidth / 2, by + ctx.lineWidth / 2 + r);
    ctx.arc(bx + ctx.lineWidth / 2 + r, by + ctx.lineWidth / 2 + r, r, Math.PI * 1.0, Math.PI * 1.5);
    ctx.fill();
    if (stroke !== "") {
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
    outline = 0,
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
    fontName = "sans-serif",
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
    if (hovered) {
        setCursorMode(CursorMode.Click);
        if (mouse[2]) {
            onClick();
        }
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

//#region Fade
function fade(x: number, color: CanvasStyle = "black") {
    if (x > 0) {
        ctx.globalAlpha = x;
        rect(0, 0, w, h, color);
        ctx.globalAlpha = 1;
    }
}
export let isFading = false;

let fadeScene: Scene;
export function fadeToScene(scene: Scene) {
    if (isFading) return;
    fadeScene = scene;
    isFading = true;
    startTimer("__scene_fade_out", FadeDuration);
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
        img.src = `/assets/img/${url}`;
    });
}
//#endregion

//#region Sound
const sounds: Record<string, AudioBuffer> = {};
const sources: Record<string, AudioBufferSourceNode[]> = {};

export async function loadSounds(soundList: string[]) {
    for (const path of soundList) {
        const id = path.replace(/\//g, "_");
        const arrayBuffer = await (await fetch(`/assets/snd/${path}.mp3`)).arrayBuffer();
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
            sounds[id] = audioBuffer;
        });
    }
}

let audioContext: AudioContext;
let volume = 1;
let gains: [number, GainNode][] = [];
export function playSound(sndID: string, vol = 1, loop = false) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = vol * volume;
    gainNode.connect(audioContext.destination);
    gains.push([vol, gainNode]);
    const source = audioContext.createBufferSource();
    source.loop = loop;
    source.buffer = sounds[sndID];
    source.connect(gainNode);
    source.start(0);
    if (!sources[sndID]) sources[sndID] = [];
    sources[sndID].push(source);
    source.addEventListener("ended", () => {
        if (!source.loop) {
            gains = gains.filter((g) => g[1] !== gainNode);
        }
    });
    return source;
}
export function setGlobalVolume(newVolume: number) {
    volume = newVolume;
    for (const [originalVolume, node] of gains) {
        node.gain.value = originalVolume * newVolume;
    }
}
//#endregion

export let deltaTime = 1;
let lastLoop = performance.now();
const fpsc: number[] = [];
const fpscc = 30;
let targetFramerate = 75;
export function setTargetFramerate(fps: number) {
    targetFramerate = fps;
}
function calculateFPS() {
    const thisLoop = Date.now();
    const fps = 1000 / (thisLoop - lastLoop);
    fpsc.push(fps);
    if (fpsc.length > fpscc) fpsc.shift();
    deltaTime = (thisLoop - lastLoop) / targetFramerate;
    lastLoop = thisLoop;
}

export function getFPS() {
    return Math.round(fpsc.reduce((a, b) => a + b, 0) / fpsc.length);
}

export let debugMode = localStorage.getItem("debug") == "1";
export let debugCamera = new SceneCamera();
export let debugCameraFollowsSceneCamera = true;
let debugLines: string[] = [];

export function addDebugLine(line: string) {
    debugLines.push(line);
}

function handleDebugKeys() {
    const cameraSpeed = 50;
    if (getKeyDown("numpad0")) {
        debugCamera.x = currentScene.camera.x;
        debugCamera.y = currentScene.camera.y;
        debugCamera.zoom = currentScene.camera.zoom;
        debugCameraFollowsSceneCamera = true;
    }
    if (getKey("numpad4")) {
        debugCamera.x -= (cameraSpeed * deltaTime) / debugCamera.zoom;
        debugCameraFollowsSceneCamera = false;
    }
    if (getKey("numpad6")) {
        debugCamera.x += (cameraSpeed * deltaTime) / debugCamera.zoom;
        debugCameraFollowsSceneCamera = false;
    }
    if (getKey("numpad5")) {
        debugCamera.y += (cameraSpeed * deltaTime) / debugCamera.zoom;
        debugCameraFollowsSceneCamera = false;
    }
    if (getKey("numpad8")) {
        debugCamera.y -= (cameraSpeed * deltaTime) / debugCamera.zoom;
        debugCameraFollowsSceneCamera = false;
    }
    if (getKeyDown("numpad9")) {
        debugCamera.zoom *= 1.1;
        debugCameraFollowsSceneCamera = false;
    }
    if (getKeyDown("numpad3")) {
        debugCamera.zoom /= 1.1;
        debugCameraFollowsSceneCamera = false;
    }
}

function drawDebugInfo() {
    const LINEBREAK = "---";
    const HEAD = (h: string) => {
        return `${LINEBREAK} ${h} ${LINEBREAK}`;
    };
    const debugText = ["Konalt Engine Debug Mode"];
    debugText.push(`FPS: ${getFPS()}`);
    debugText.push(`Viewport: ${canvas.width}x${canvas.height}`);
    debugText.push(`Scaled: ${w}x${h}`);
    debugText.push(`AR: ${Math.floor((w / h) * 1e4) / 1e4}`);
    debugText.push(HEAD(`Held Keys (${heldKeys.length})`));
    if (heldKeys.length > 0) {
        for (const key of heldKeys) {
            debugText.push(key);
        }
    } else {
        debugText.push(`[None]`);
    }
    debugText.push(HEAD(`Mouse`));
    debugText.push(`Position: ${Math.round(mouseX)} ${Math.round(mouseY)}`);
    debugText.push(HEAD("Scene"));
    debugText.push(`Name: ${currentScene.constructor.name}`);
    debugText.push(HEAD("Camera"));
    debugText.push(`Center: ${Math.floor(currentScene.camera.x)} ${Math.floor(currentScene.camera.y)}`);
    debugText.push(`Zoom: ${Math.floor(currentScene.camera.zoom * 1e4) / 1e4}x`);
    debugText.push(HEAD("Debug Camera"));
    debugText.push(`Center: ${Math.floor(debugCamera.x)} ${Math.floor(debugCamera.y)}`);
    debugText.push(`Zoom: ${Math.floor(debugCamera.zoom * 1e4) / 1e4}x`);
    debugText.push(HEAD("Sound"));
    debugText.push(`Current volume: ${Math.round(volume * 100)}%`);
    debugText.push(`Sounds playing: ${gains.length}`);
    if (debugLines.length > 0) {
        debugText.push(HEAD("Game Debug"));
        debugText.push(...debugLines);
    }
    debugLines = [];
    ctx.textBaseline = "top";
    const textWidth = Math.max(...debugText.map((l) => ctx.measureText(l).width));
    rect(w, 0, textWidth + 8, h, "rgba(0,0,0,0.4)", "transparent", 0, "tr");
    text(w - 4, 4, debugText.join("\n"), "white", "18px monospace", "right", textWidth);
}

function draw() {
    globalTimer = performance.now();
    try {
        calculateFPS();
        setCursorMode(CursorMode.Default);
        if (getKeyDown("F3")) {
            debugMode = !debugMode;
            debugCameraFollowsSceneCamera = true;
            localStorage.setItem("debug", Number(debugMode).toString());
        }
        if (debugMode) {
            handleDebugKeys();
        }
        currentScene.update();
        if (debugCameraFollowsSceneCamera && debugMode) {
            console.log("lhelloehjdsg");

            debugCamera.x = currentScene.camera.x;
            debugCamera.y = currentScene.camera.y;
            debugCamera.zoom = currentScene.camera.zoom;
        }
        ctx.clearRect(0, 0, w, h);
        if (debugMode) {
            currentScene.debugDraw();
        } else {
            currentScene.draw();
        }
        let fadeTimer = timer("__scene_fade_out") || timer("__scene_fade_in");
        if (fadeTimer > 0) {
            fade(fadeTimer);
            timerEnd(
                "__scene_fade_out",
                () => {
                    setScene(fadeScene, true).then(() => {
                        removeTimer("__scene_fade_out");
                    });
                },
                false,
            );
        }
        timerEnd("__scene_fade_in", () => {
            isFading = false;
        });
        ctx.restore();
        if (debugMode) {
            drawDebugInfo();
        }
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

export let game = "unknown";

export function init(_g: string) {
    game = _g;
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
        { capture: true },
    );
    onResize();
    audioContext = new AudioContext();
    window.addEventListener("resize", onResize);
    lastLoop = performance.now();
    draw();
}

export let currentScene: Scene;

export async function setScene(scene: Scene, fadeIn = false, sceneInit: Record<string, any> = {}) {
    await scene.init(sceneInit);
    currentScene = scene;
    debugCamera.x = scene.camera.x;
    debugCamera.y = scene.camera.y;
    debugCamera.zoom = scene.camera.zoom / 1.1;
    if (fadeIn) {
        startTimer("__scene_fade_in", FadeDuration, true);
    }
}

export function since(timestamp: number) {
    return globalTimer - timestamp;
}

export const d = {
    rect,
    circ,
    roundRect,
    text,
    button,
    quickImage,
};
