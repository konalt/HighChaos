import { easeInQuad, easeOutCirc, easeOutQuad } from "../../../lib/engine/ease";
import {
    ctx,
    d,
    deltaTime,
    h,
    loadImage,
    since,
    startTimer,
    timer,
    timerEnd,
    useCanvas,
    w,
} from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { lerp } from "../../../lib/engine/utils";
import { NULLTEXTURE } from "../../../lib/ui/hcimage";

const introDuration = 1000;
const beatPeriod = 800;
const beatAttack = 0.05;
const beatScale = 0.065;

export class CAHMenuTitle extends GameObject {
    private _img: HTMLImageElement;
    private _spawnTime: number;

    beat: number;
    rotation: number;

    startY: number;
    endY: number;
    renderY: number;

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
        this.rotation = Math.cos(since(this._spawnTime) * 0.0005) * 0.1;

        this.renderY = lerp(easeOutQuad(timer(`intro${this.uuid}`, true)), this.startY, this.endY);

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

        console.log(timer(`beat${this.uuid}`));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.renderY);
        ctx.rotate(this.rotation);
        d.quickImage(this._img, 0, 0, 0.7 + this.beat * beatScale);
        ctx.restore();
    }

    init() {
        startTimer(`intro${this.uuid}`, introDuration);
        startTimer(`beat${this.uuid}`, beatPeriod);
        this._spawnTime = performance.now();
    }

    async load() {
        this._img = await loadImage("cahv2/title.png");
    }
}
