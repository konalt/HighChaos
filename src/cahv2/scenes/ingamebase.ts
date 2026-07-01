import { ctx, debugMode, h, w } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { CAHInGameBackground } from "../objects/ui/ingamebackground";
import { CAHInGamePlayerList } from "../objects/ui/ingameplayerlist";
import { CAHBaseScene } from "./base";

export class CAHInGameBaseScene extends CAHBaseScene {
    background: CAHInGameBackground;
    playerList: CAHInGamePlayerList;

    leftStart: number = 100;
    centerLine: number = 500;
    width: number = 1000;

    constructor() {
        super();

        this.background = new CAHInGameBackground();
        this.add(this.background, UI_LAYER);

        this.playerList = new CAHInGamePlayerList();
        this.add(this.playerList, UI_LAYER + 1);
    }

    update(): void {
        this.leftStart = this.playerList.width;
        this.width = w - this.leftStart;
        this.centerLine = w / 2 + this.leftStart / 2;

        super.update();
    }

    draw() {
        super.draw();

        if (debugMode) {
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
    }
}
