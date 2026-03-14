import { setScene, w } from "../../engine/engine";
import { Background } from "../../engine/objects/background";
import { ImageObject } from "../../engine/objects/image";
import { Scene } from "../../engine/scene";
import { connect } from "../game";
import { InGameScene } from "./ingame";

export class ConnectScene extends Scene {
    constructor() {
        super();

        let background = new Background();
        background.color = "#111";
        this.add(background);

        let titleImage = new ImageObject();
        titleImage.x = w / 2;
        titleImage.y = 200;
        titleImage.scale = 1.5;
        titleImage.src = "creative/txt/title.png";
        this.add(titleImage);
    }

    async init() {
        super.init();

        connect().then(() => {
            setScene(new InGameScene());
        });
    }
}
