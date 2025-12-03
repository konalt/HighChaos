import * as scene_menu from "./scenes/menu";
import * as c from "./engine";
import { Scene } from "./utils";

export function setScene(scene: Scene) {
    scene.init();
    c.setDrawFunction(scene.draw);
}

setScene(scene_menu);

c.init();
