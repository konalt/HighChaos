import { Scene } from "../../lib/engine/scene";
import { Background } from "../../lib/ui/background/background";
import { Road } from "../objects/road";

export class MainScene extends Scene {
    constructor() {
        super();

        let background = new Background();
        background.color = "#25bd25";
        this.add(background, -1);

        let testRoad = new Road();
        this.add(testRoad);

        this.camera.x = 0;
        this.camera.y = 0;
    }
}
