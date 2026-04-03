import { ctx, d, debugMode, font, loadImage, since } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { lerp } from "../../lib/engine/utils";
import { pingTable } from "../game/ping";
import { ClientPlayerState } from "../net/interp";
import { testPlayerImage } from "../scenes/ingame";

const playerHeight = 150;

export class PlayerObject extends GameObject {
    name: string = "unnamed";
    ply: ClientPlayerState;

    constructor(ply: ClientPlayerState) {
        super();
        this.ply = ply;
    }

    draw() {
        //d.circ(this.ply.sv_x, this.ply.sv_y, 3, "rgb(255, 0, 0)");

        let drawX = this.ply.x;
        let drawY = this.ply.y;
        ctx.save();
        ctx.translate(drawX, drawY);

        d.quickImage(testPlayerImage, 0, 0, playerHeight / testPlayerImage.height, "bc");

        ctx.font = font(24);
        ctx.textBaseline = "alphabetic";

        const nameMeasure = ctx.measureText(this.name);
        const nameWidth = nameMeasure.width;
        const nameHeight = nameMeasure.actualBoundingBoxAscent + nameMeasure.actualBoundingBoxDescent;
        const nameBoxMarginX = 8;
        const nameBoxMarginY = 6;
        d.roundRect(
            0,
            -playerHeight - nameBoxMarginY * 2,
            nameWidth + nameBoxMarginX * 2,
            nameHeight + nameBoxMarginY * 2,
            5,
            "rgba(0,0,0,0.5)",
            "",
            0,
            "bc",
        );

        d.text(0, -playerHeight - nameBoxMarginY * 4, this.name ?? ":3", "#fff", ctx.font, "center");

        if (debugMode) {
            d.text(
                0,
                -playerHeight - nameBoxMarginY * 10 - 80,
                "Ping: " +
                    Math.round(pingTable[this.ply.id]).toString() +
                    "ms\n" +
                    `x: ${this.ply.x}, y: ${this.ply.y}, vx: ${this.ply.vx}, vy: ${this.ply.vy}`,
                "red",
                ctx.font,
                "center",
            );
        }

        ctx.restore();
    }

    async load() {
        await super.load();
    }
}
