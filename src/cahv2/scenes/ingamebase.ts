import { easeOutQuad } from "../../lib/engine/ease";
import { ctx, debugMode, h, removeTimer, setScene, startTimer, timer, timerEnd, w } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { lerp } from "../../lib/engine/utils";
import { CAHInGameBackground, Particle } from "../objects/ui/ingamebackground";
import { CAHInGamePlayerList } from "../objects/ui/ingameplayerlist";
import { CAHBaseScene } from "./base";

export class CAHInGameBaseScene extends CAHBaseScene {
    background: CAHInGameBackground;
    playerList: CAHInGamePlayerList;

    leftStart: number = 100;
    centerLine: number = 500;
    width: number = 1000;

    transitionDuration = 300;

    constructor(backgroundParticles: Particle[]) {
        super();

        this.background = new CAHInGameBackground(backgroundParticles);
        this.add(this.background, UI_LAYER);

        this.playerList = new CAHInGamePlayerList();
        this.leftStart = this.playerList.width;
        this.width = w - this.leftStart;
        this.centerLine = w / 2 + this.leftStart / 2;
        this.add(this.playerList, UI_LAYER + 20);
    }

    update(): void {
        this.leftStart = this.playerList.width;
        this.width = w - this.leftStart;
        this.centerLine = w / 2 + this.leftStart / 2;

        timerEnd(
            "s_finish",
            () => {
                if (this._nextScene) {
                    setScene(this._nextScene);
                } else {
                    console.log("transition ended with no scene??");
                    removeTimer("s_finish");
                }
            },
            false,
        );

        timerEnd(
            "s_start",
            () => {
                this._isTransitioning = false;
            },
            true,
        );

        super.update();
    }

    draw() {
        super.draw();
    }

    debugDraw(): void {
        super.debugDraw();

        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(this.leftStart, 0);
        ctx.lineTo(this.leftStart, h);

        ctx.strokeStyle = "lime";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.centerLine, 0);
        ctx.lineTo(this.centerLine, h);

        ctx.strokeStyle = "blue";
        ctx.stroke();
    }

    async init(a: any) {
        await super.init(a);

        startTimer("s_start", this.transitionDuration);
    }

    private _isTransitioning = true;
    private _isFinishing = false;
    private _nextScene: CAHInGameBaseScene | null = null;

    finish(nextScene: CAHInGameBaseScene) {
        this._isFinishing = true;
        this._isTransitioning = true;
        this._nextScene = nextScene;
        startTimer("s_finish", this.transitionDuration);
    }

    tlerp(a: number, b: number, end: number | null = null, ease = true) {
        if (!this._isTransitioning) {
            return b;
        }

        if (this._isFinishing) {
            const t = timer("s_finish", true);
            if (ease) {
                return lerp(easeOutQuad(t), b, end ?? a);
            } else {
                return lerp(t, b, end ?? a);
            }
        } else {
            const t = timer("s_start", true);
            if (ease) {
                return lerp(easeOutQuad(t), a, b);
            } else {
                return lerp(t, a, b);
            }
        }
    }
}
