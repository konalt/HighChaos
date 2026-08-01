import { font, h, w } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { HCText } from "../../lib/ui/hctext";
import { CAHButton } from "../objects/ui/cahbtn";
import { CAHMainMenuScene } from "./mainmenu";
import { CAHMenuBaseScene } from "./menubase";

const SceneMargin = 20;
const ButtonGap = 15;

export class CAHSettingsScene extends CAHMenuBaseScene {
    backButton: CAHButton;
    applyButton: CAHButton;

    constructor() {
        super();

        this.applyButton = new CAHButton("Apply");
        this.applyButton.background = "#89b670";
        this.applyButton.border = "#4a8f4e";
        this.applyButton.disabled = true;
        this.applyButton.onClick = () => {
            this.transitionToScene(new CAHMainMenuScene(), {
                skipIntro: true,
            });
        };
        this.applyButton.anchor = "cr";
        this.applyButton.x = w - SceneMargin;
        this.applyButton.y = h - SceneMargin - 40;
        this.add(this.applyButton, UI_LAYER);

        this.backButton = new CAHButton("Back");
        this.backButton.onClick = () => {
            this.transitionToScene(new CAHMainMenuScene(), {
                skipIntro: true,
            });
        };
        this.backButton.anchor = "cr";
        this.backButton.x = w - SceneMargin - this.applyButton.bw - ButtonGap;
        this.backButton.y = h - SceneMargin - 40;
        this.add(this.backButton, UI_LAYER);

        // TODO: remove this when you can
        const underconstruction = new HCText();
        underconstruction.color = "#e05a5a";
        underconstruction.x = w / 2;
        underconstruction.y = h / 2;
        underconstruction.text = "the settings menu is\nunder construction :3";
        underconstruction.font = font(68);
        underconstruction.anchor = "cc";
        this.add(underconstruction, UI_LAYER);
    }
}
