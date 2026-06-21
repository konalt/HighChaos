import { h } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { GradientType } from "../../lib/engine/utils";
import { GradientBackground } from "../../lib/ui/background/gradientbackground";
import { CAHBackground } from "../objects/ui/background";
import { CAHBetterBackground } from "../objects/ui/betterbackground";

export class CAHMenuBaseScene extends Scene {
    background: CAHBetterBackground;

    constructor() {
        super();

        this.background = new CAHBetterBackground();
        this.add(this.background, UI_LAYER);
    }
}
