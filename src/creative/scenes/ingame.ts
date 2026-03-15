import { h } from "../../lib/engine/engine";
import { Scene } from "../../lib/engine/scene";
import { GradientType } from "../../lib/engine/utils";
import { GradientBackground } from "../../lib/ui/background/gradientbackground";

export class InGameScene extends Scene {
    background: GradientBackground;

    constructor() {
        super();

        this.background = new GradientBackground();
        this.background.type = GradientType.Radial;
        this.background.colors = ["#3098fa", "#184fe6"];
        this.background.scale = 1.5;
        this.background.y = h / 2;
        this.add(this.background);
    }

    update(): void {
        super.update();
    }
}
