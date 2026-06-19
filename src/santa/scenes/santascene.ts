import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { Hills } from "../objects/hillsfront";
import { MuteButton } from "../objects/mutebutton";
import { SkyDark } from "../objects/skydark";
import { SnowDisplay } from "../objects/snow";

export class SantaScene extends Scene {
    sky: SkyDark;
    snowBG: SnowDisplay;
    snowFG: SnowDisplay;
    hills: Hills;

    muteButton: MuteButton;

    constructor() {
        super();

        this.sky = new SkyDark();
        this.add(this.sky);

        this.snowBG = new SnowDisplay(false);
        this.add(this.snowBG);

        this.hills = new Hills();
        this.add(this.hills);

        this.snowFG = new SnowDisplay(true);
        this.add(this.snowFG, 100);

        this.muteButton = new MuteButton();
        this.add(this.muteButton, UI_LAYER);
    }
}
