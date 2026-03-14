import { ctx, d, fadeToScene, getKeyDown, getMouse, isFading, playSound } from "../../lib/engine/engine";
import * as scene_game from "../scenes/game";
import { grey } from "../../lib/engine/utils";

export function draw(x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    d.button(0, 0, 72, "Play", grey(1), grey(0.9), "black", [...getMouse(), !isFading && getKeyDown("mouse1")], () => {
        playSound("santa_merrychristmas", 0.5);
        fadeToScene(scene_game);
    });
    ctx.restore();
}
