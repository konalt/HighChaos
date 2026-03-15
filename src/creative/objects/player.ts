import { ctx, d, font } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";

export class PlayerObject extends GameObject {
    name: string = "unnamed";

    constructor() {
        super();
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        d.rect(0, 0, 30, 100, "white", "", 0, "bc");

        ctx.font = font(24);
        ctx.textBaseline = "alphabetic";

        const nameMeasure = ctx.measureText(this.name);
        const nameWidth = nameMeasure.width;
        const nameHeight = nameMeasure.actualBoundingBoxAscent + nameMeasure.actualBoundingBoxDescent;
        const nameBoxMarginX = 8;
        const nameBoxMarginY = 6;
        d.roundRect(
            0,
            -120,
            nameWidth + nameBoxMarginX * 2,
            nameHeight + nameBoxMarginY * 2,
            5,
            "rgba(0,0,0,0.5)",
            "",
            0,
            "bc",
        );

        d.text(0, -120 - nameBoxMarginY, this.name, "#fff", ctx.font, "center");

        ctx.restore();
    }
}
