import { h } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { GradientType } from "../../lib/engine/utils";
import { GradientBackground } from "../../lib/ui/background/gradientbackground";
import { CAHBackground } from "../objects/ui/background";

export class CAHMenuBaseScene extends Scene {
    background: CAHBackground;

    constructor() {
        super();

        this.background = new CAHBackground();
        this.add(this.background, UI_LAYER);
    }
}
