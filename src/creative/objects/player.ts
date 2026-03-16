import { ctx, d, font, loadImage, since } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { lerp } from "../../lib/engine/utils";
import { gameSettings, Player } from "../game";
import { lastPlayerUpdatePacket } from "../handlers";

const playerHeight = 150;

export class PlayerObject extends GameObject {
    name: string = "unnamed";
    ply: Player;
    img: HTMLImageElement;

    constructor() {
        super();
    }

    draw() {
        let t = Math.min(since(lastPlayerUpdatePacket) / gameSettings.updateRate, 1);

        let drawX = lerp(t, this.ply.old_x, this.ply.x);
        let drawY = lerp(t, this.ply.old_y, this.ply.y);
        ctx.save();
        ctx.translate(drawX, drawY);

        //d.rect(0, 0, 30, 100, "white", "", 0, "bc");
        d.quickImage(this.img, 0, 0, playerHeight / this.img.height, "bc");

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

        ctx.restore();
    }

    async load() {
        await super.load();

        this.img = await loadImage("creative/testplayer.png");
    }
}
