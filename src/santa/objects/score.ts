import { ctx, d, font } from "../../engine/engine";
import { score } from "../scenes/game";

export function draw() {
    const txt = `Score: ${score}`;
    ctx.textBaseline = "top";
    d.text(0, 0, txt, "white", font(48), "left");
}
