import { ctx, d, deltaTime, loadImage, startTimer, timer, timerEnd, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { lerpPositions } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { GameScene } from "../scenes/game";

let img = NULLTEXTURE;

export class Present extends GameObject {
    private _timer = `pc${Math.floor(Math.random() * 1e8)}`;

    dx = 0;
    dy = 0;
    collected = false;
    collectX = 0;
    collectY = 0;
    delay = 0;

    constructor() {
        super();
    }

    randomize() {
        this.x = Math.random() * w * 0.7 + w * 0.15;
        this.y = -50;
        this.dx = (Math.random() - 0.5) * 100;
        this.dy = 150 + Math.random() * 225;
    }

    draw(): void {
        ctx.save();
        ctx.globalAlpha = 1 - timer(this._timer, true);
        d.quickImage(img, this.x, this.y, 0.2);
        ctx.restore();
    }

    update(): void {
        if (this.scene instanceof GameScene) {
            if (this.collected) {
                const lerped = lerpPositions(
                    timer(this._timer, true),
                    this.collectX,
                    this.collectY,
                    this.scene.sack.x,
                    this.scene.sack.y,
                );
                this.x = lerped[0];
                this.y = lerped[1];
                timerEnd(this._timer, () => {
                    this.randomize();
                    this.collected = false;
                });
            } else {
                this.x += this.dx * deltaTime;
                this.y += this.dy * deltaTime * this.scene.gravity;
            }
        }
    }

    collect() {
        if (this.collected) return;
        this.collected = true;
        this.collectX = this.x;
        this.collectY = this.y;
        startTimer(this._timer, 300, false);
    }

    async load() {
        if (!img) img = await loadImage("santa/gift.png");
    }
}
