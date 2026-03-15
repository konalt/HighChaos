import { ctx, d } from "../engine/engine";
import { GameObject } from "../engine/object";
import { Anchor } from "../engine/utils";

export class HCText extends GameObject {
    text: string;
    font: string;
    anchor: Anchor;

    constructor() {
        super();

        this.text = this.constructor.name;
        this.font = ctx.font;
        this.anchor = "bl";
    }

    draw() {
        let align: CanvasTextAlign = "left";
        switch (this.anchor.split("")[1]) {
            case "l":
                align = "left";
                break;
            case "c":
                align = "center";
                break;
            case "r":
                align = "right";
                break;
        }
        d.text(this.x, this.y, this.text, this.color, this.font, align);
    }
}
