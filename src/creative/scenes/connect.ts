import { h, setScene, w } from "../../lib/engine/engine";
import { Background } from "../../lib/ui/background";
import { HCImage } from "../../lib/ui/hcimage";
import { Scene } from "../../lib/engine/scene";
import { connect } from "../game";
import { SpinnerLoader } from "../../lib/ui/loaders/spinner";
import { InGameScene } from "./ingame";

export class ConnectScene extends Scene {
    constructor() {
        super();

        let background = new Background();
        background.color = "#111";
        this.add(background);

        let titleImage = new HCImage();
        titleImage.x = w / 2;
        titleImage.y = 200;
        titleImage.scale = 1.5;
        titleImage.src = "creative/txt/title.png";
        this.add(titleImage);

        let loader = new SpinnerLoader();
        loader.x = w / 2;
        loader.y = h / 2;
        this.add(loader);
    }

    async init() {
        await super.init();

        connect().then(() => {
            setScene(new InGameScene());
        });
    }
}
