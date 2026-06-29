import { easeOutCirc } from "../../../lib/engine/ease";
import { ctx, d, h, loadImage, removeTimer, startTimer, timer, timerEnd, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { NULLTEXTURE } from "../../../lib/ui/hcimage";
import { COLOR } from "../../color";

const Slant = 300;
const Duration = 600;

let _img: HTMLImageElement;

export class CAHSceneTransition extends GameObject {
    state = 0;

    private _onFinish: () => void = () => {};

    constructor() {
        super();
    }

    update() {
        timerEnd(
            `cover${this.uuid}`,
            () => {
                this.state = 2;
                this._onFinish();
                this._onFinish = () => {};
            },
            false,
        );

        timerEnd(
            `uncover${this.uuid}`,
            () => {
                this.state = 0;
                removeTimer(`cover${this.uuid}`);
                removeTimer(`uncover${this.uuid}`);
                this._onFinish();
                this._onFinish = () => {};
            },
            false,
        );
    }

    draw() {
        //if (this.state == 0) return;

        let factor1 = 1 - easeOutCirc(timer(`cover${this.uuid}`, true));
        let factor2 = 1 - easeOutCirc(timer(`uncover${this.uuid}`, true));
        const TotalW = w + Slant * 2;
        ctx.beginPath();
        ctx.moveTo(factor2 * TotalW - Slant, 0);
        ctx.lineTo(factor1 * TotalW, 0);
        ctx.lineTo(factor1 * TotalW - Slant, h);
        ctx.lineTo(factor2 * TotalW - Slant * 2, h);
        ctx.closePath();

        ctx.save();
        // INSANE DEVELOPMENTS
        ctx.clip();

        if (_img) ctx.drawImage(_img, 0, 0, w, h);

        ctx.restore();
    }

    cover(onFinish = () => {}) {
        if (this.state != 0) return;
        this.state = 1;
        this._onFinish = onFinish;
        startTimer(`cover${this.uuid}`, Duration);
    }

    uncover(onFinish = () => {}) {
        if (this.state != 2) return;
        this.state = 3;
        this._onFinish = onFinish;
        startTimer(`uncover${this.uuid}`, Duration);
    }

    instaCover() {
        this.state = 2;
        startTimer(`cover${this.uuid}`, 1);
    }

    instaUncover() {
        this.state = 0;
        removeTimer(`cover${this.uuid}`);
        removeTimer(`uncover${this.uuid}`);
    }

    toggle(onFinish = () => {}) {
        if (this.state == 0) {
            this.cover(onFinish);
        } else if (this.state == 2) {
            this.uncover(onFinish);
        }
    }

    async load() {
        await super.load();
        _img = NULLTEXTURE;
        _img = await loadImage("cahv2/transition_teto.png");
    }
}
