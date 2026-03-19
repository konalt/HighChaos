import { ctx, d, debugMode, font, loadImage, since } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { lerp } from "../../lib/engine/utils";
import { gameSettings, pingTable, Player } from "../game";
import { lastPlayerUpdate } from "../handlers";
import { testPlayerImage } from "../scenes/ingame";

const playerHeight = 150;

export class PlayerObject extends GameObject {
    name: string = "unnamed";
    ply: Player;

    constructor() {
        super();
    }

    draw() {
        let t = Math.min(since(lastPlayerUpdate[this.ply.id]) / gameSettings.updateRate, 1);

        d.circ(this.ply.sv_x, this.ply.sv_y, 3, "rgb(255, 0, 0)");

        let drawX = lerp(t, this.ply.old_x, this.ply.x);
        let drawY = lerp(t, this.ply.old_y, this.ply.y);
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

        d.text(0, -playerHeight - nameBoxMarginY * 4, this.name, "#fff", ctx.font, "center");

        if (debugMode) {
            d.text(
                0,
                -playerHeight - nameBoxMarginY * 10,
                "Ping: " + Math.round(pingTable[this.ply.id]).toString() + "ms",
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
