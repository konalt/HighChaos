import { fadeToScene, font, h, setScene, w } from "../../lib/engine/engine";
import { Background } from "../../lib/ui/background/background";
import { HCImage } from "../../lib/ui/hcimage";
import { Scene } from "../../lib/engine/scene";
import { connect } from "../game";
import { SpinnerLoader } from "../../lib/ui/loaders/spinner";
import { InGameScene } from "./ingame";
import { GradientBackground } from "../../lib/ui/background/gradientbackground";
import { GradientType, sleep } from "../../lib/engine/utils";
import { LoadingText } from "../objects/menu/loadingtext";

export class ConnectScene extends Scene {
    loader: SpinnerLoader;
    loadingText: LoadingText;

    constructor() {
        super();

        let background = new GradientBackground();
        background.type = GradientType.Radial;
        background.colors = ["#111", "#0a0a0a"];
        this.add(background, -1);

        let titleImage = new HCImage();
        titleImage.x = w / 2;
        titleImage.y = 200;
        titleImage.scale = 1.5;
        titleImage.src = "creative/txt/title.png";
        this.add(titleImage);

        this.loader = new SpinnerLoader();
        this.loader.x = w / 2;
        this.loader.y = h / 2 + 200;
        this.add(this.loader);

        this.loadingText = new LoadingText();
        this.loadingText.x = w / 2;
        this.loadingText.y = h / 2;
        this.add(this.loadingText);
    }

    async init() {
        await super.init();

        connect().then(async () => {
            //await sleep(1000);
            this.loadingText.overrideText = "Ready!";
            this.loader.enabled = false;
            fadeToScene(new InGameScene());
        });
    }
}
