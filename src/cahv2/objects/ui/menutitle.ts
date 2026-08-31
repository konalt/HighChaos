import { easeInOutBack, easeInOutQuad, easeInQuad, easeOutCirc, easeOutQuad } from "../../../lib/engine/ease";
import {
    ctx,
    CursorMode,
    d,
    debugMode,
    deltaTime,
    getKeyDown,
    getMouse,
    h,
    loadImage,
    setCursorMode,
    since,
    startTimer,
    timer,
    timerEnd,
    useCanvas,
    w,
} from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { playSound } from "../../../lib/engine/sound";
import { basicPointInRect, FourNums, lerp } from "../../../lib/engine/utils";
import { NULLTEXTURE } from "../../../lib/ui/hcimage";
import { COLOR } from "../../color";

const introDuration = 1500;
const beatPeriod = 800;
const beatAttack = 0.05;
const beatScale = 0.065;

export class CAHMenuTitle extends GameObject {
    private _img: HTMLImageElement;
    private _spawnTime: number;
    private _hovered: boolean = false;

    private _bw = 0;
    private _bh = 0;

    scale: number = 0.7;
    beat: number;
    rotation: number;
    flip = 0;
    isSecondFlip = false;
    isFlipping = false;

    startY: number;
    endY: number;
    renderY: number;

    skipIntro: boolean = false;

    constructor() {
        super();

        this.x = w / 2;

        this.startY = -300;
        this.endY = 220;
        this.renderY = 0;

        this.rotation = 0;

        this.beat = 0;
        this._spawnTime = 0;
        this._img = NULLTEXTURE;
    }

    update() {
        this.flip = (this.isSecondFlip ? 1 : 0) + easeInOutBack(timer(`flip${this.uuid}`, true));
        this.rotation = Math.cos(since(this._spawnTime) * 0.0005) * 0.1 + this.flip * Math.PI;
        timerEnd(`flip${this.uuid}`, () => {
            this.isFlipping = false;
            this.isSecondFlip = !this.isSecondFlip;
        });

        this.renderY = lerp(easeOutCirc(timer(`intro${this.uuid}`, true)), this.startY, this.endY);

        const beat = timer(`beat${this.uuid}`);
        if (beat < beatAttack) {
            this.beat = easeInQuad(beat / beatAttack);
        } else {
            this.beat = 1 - easeInQuad((beat - beatAttack) / (1 - beatAttack));
        }
        timerEnd(
            `beat${this.uuid}`,
            () => {
                startTimer(`beat${this.uuid}`, beatPeriod);
            },
            false,
        );

        // fun stuff check
        this._bw = this._img.width * (this.scale + this.beat * beatScale);
        this._bh = this._img.height * (this.scale + this.beat * beatScale);
        const bbRect: FourNums = [this.x - this._bw / 2, this.renderY - this._bh / 2, this._bw, this._bh];
        this._hovered = basicPointInRect(...getMouse(), ...bbRect);

        if (this._hovered) {
            setCursorMode(CursorMode.Click);
            if (getKeyDown("mouse1") && !this.isFlipping) {
                this.isFlipping = true;
                startTimer(`flip${this.uuid}`, 500);
                playSound("cards/slip", 0.6);
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.renderY);
        ctx.rotate(this.rotation);
        d.quickImage(this._img, 0, 0, this.scale + this.beat * beatScale);
        if (debugMode && this._hovered) {
            d.rect(-this._bw / 2, -this._bh / 2, this._bw, this._bh, COLOR.elementFill);
        }
        ctx.restore();
    }

    init() {
        startTimer(`intro${this.uuid}`, this.skipIntro ? 1 : introDuration);
        startTimer(`beat${this.uuid}`, beatPeriod);
        this._spawnTime = performance.now();
    }

    async load() {
        this._img = await loadImage("cahv2/title.png");
    }
}
