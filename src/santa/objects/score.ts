import { ctx, d, font } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { getSavedBest } from "../save";

export class ScoreDisplay extends GameObject {
    best = 0;
    score = 0;

    constructor() {
        super();
    }

    draw() {
        // Drawing code goes here
        const txt = `Score: ${this.score}\n(Best: ${this.best})`;
        ctx.textBaseline = "top";
        d.text(0, 0, txt, "white", font(48), "left");
    }

    init() {
        this.best = getSavedBest();
    }
}
