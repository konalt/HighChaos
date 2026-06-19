import { w, h, loadImage, d, loadSounds, font, playSound, setScene } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { HCButton } from "../../lib/ui/hcbutton";
import { HCImage } from "../../lib/ui/hcimage";
import { MuteButton } from "../objects/mutebutton";
import { GameScene } from "./game";
import { SantaScene } from "./santascene";

export class MenuScene extends SantaScene {
    playButton: HCButton;

    title: HCImage;
    instructions: HCImage;

    constructor() {
        super();

        this.title = new HCImage();
        this.title.x = w / 2;
        this.title.y = 0;
        this.title.scale = 1.5;
        this.title.anchor = "tc";
        this.title.src = "santa/title.png";
        this.add(this.title, UI_LAYER + 1);

        this.instructions = new HCImage();
        this.instructions.x = w / 2;
        this.instructions.y = 535;
        this.instructions.scale = 0.8;
        this.instructions.anchor = "cc";
        this.instructions.src = "santa/instructions.png";
        this.add(this.instructions, UI_LAYER + 1);

        this.playButton = new HCButton();
        this.playButton.x = w / 2;
        this.playButton.y = 970;
        this.playButton.font = font(72);
        this.playButton.text = "Play";
        this.playButton.onClick = () => {
            playSound("santa_merrychristmas", 0.5);
            setScene(new GameScene());
        };
        this.add(this.playButton, UI_LAYER + 1);
    }

    async init() {
        super.init();
        await loadSounds([`santa/hohoho`, `santa/merrychristmas`, `santa/sleighbells`, `santa/baby`]);
    }
}
