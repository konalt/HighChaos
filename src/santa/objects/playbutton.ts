import { ctx, d, getKeyDown, getMouse, isFading } from "../../lib/engine/engine";
import { grey } from "../../lib/engine/utils";
import { playSound } from "../../lib/engine/sound";

export function draw(x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);
    d.button(0, 0, 72, "Play", grey(1), grey(0.9), "black", [...getMouse(), !isFading && getKeyDown("mouse1")], () => {
        playSound("merrychristmas", 0.5);
        //fadeToScene(scene_game);
    });
    ctx.restore();
}
