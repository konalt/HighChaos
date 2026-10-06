import { d, font, h, setScene, w } from "../../lib/engine/engine";
import { getSavedBest, saveBest } from "../save";
import { SantaScene } from "./santascene";
import { HCButton } from "../../lib/ui/hcbutton";
import { UI_LAYER } from "../../lib/engine/scene";
import { GameScene } from "./game";
import { HCRect } from "../../lib/ui/hcrect";
import { MenuScene } from "./menu";
import { playSound } from "../../lib/engine/sound";

let presentsCollected = 0;
let best = 0;
let isNewBest = false;

const scw = 700;

export async function init(init: Record<string, any>) {
    presentsCollected = init.presents;
    isNewBest = saveBest(presentsCollected);
    if (!isNewBest) {
        best = getSavedBest();
    } else {
        best = presentsCollected;
    }
}

export class GameOverScene extends SantaScene {
    presentsCollected = 0;
    isNewBest = false;
    playButton: HCButton;
    menuButton: HCButton;

    constructor() {
        super();

        this.playButton = new HCButton();
        this.playButton.x = w / 2;
        this.playButton.y = 700;
        this.playButton.font = font(72);
        this.playButton.text = "Play again";
        this.playButton.onClick = () => {
            playSound("merrychristmas", 0.5);
            setScene(new GameScene());
        };
        this.add(this.playButton, UI_LAYER + 1);

        this.menuButton = new HCButton();
        this.menuButton.x = w / 2;
        this.menuButton.y = 850;
        this.menuButton.font = font(72);
        this.menuButton.text = "Back to menu";
        this.menuButton.onClick = () => {
            setScene(new MenuScene());
        };
        this.add(this.menuButton, UI_LAYER + 1);

        let rect = new HCRect();
        rect.x = w / 2;
        rect.y = h / 2;
        rect.w = w / 3;
        rect.h = h - 100;
        rect.anchor = "cc";
        rect.color = "rgba(0,0,0,0.5)";
        this.add(rect, UI_LAYER);
    }

    draw() {
        super.draw();

        d.text(w / 2, 300, "Game Over", "white", font(60), "center");
        d.text(w / 2, 400, `You collected ${presentsCollected} presents.`, "white", font(48), "center");

        if (isNewBest) {
            d.text(w / 2, 500, `New best!`, "yellow", font(48), "center");
        } else {
            d.text(w / 2, 500, `Best: ${best}`, "yellow", font(48), "center");
        }
    }

    async init(init: Record<string, any>) {
        await super.init();

        presentsCollected = init.presents;
        isNewBest = saveBest(presentsCollected);
        if (!isNewBest) {
            best = getSavedBest();
        } else {
            best = presentsCollected;
        }
    }
}
