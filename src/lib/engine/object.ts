import { CanvasStyle, removeTimer, startTimer, timer, timerEnd } from "./engine";
import { Scene } from "./scene";
import { uuidv4 } from "./utils";

export class GameObject {
    x: number;
    y: number;
    color: CanvasStyle;
    scene: Scene;
    sceneLayer: number;
    enabled: boolean;
    visible: boolean;
    uuid: string;
    spawnTime: number;
    user: Record<string, any> = {};

    constructor() {
        this.x = 0;
        this.y = 0;
        this.color = "#ffffff";
        this.enabled = true;
        this.visible = true;
        this.uuid = uuidv4();
        this.spawnTime = performance.now();
    }

    draw() {
        // Draw code here
    }

    update() {
        // Update code here
    }

    fixedUpdate() {
        // Fixed update goes here
    }

    init() {
        // Init code here
    }

    async load() {
        // Async load code here
    }

    //#region timer shit
    objStartTimer(name: string, duration: number, inverse = false) {
        startTimer(this.uuid + name, duration, inverse);
    }

    objTimer(name: string, clamp = true) {
        return timer(this.uuid + name, clamp);
    }

    objTimerEnd(name: string, cb = () => {}, remove = true) {
        return timerEnd(this.uuid + name, cb, remove);
    }

    objRemoveTimer(name: string) {
        return removeTimer(this.uuid + name);
    }
    //#endregion
}
