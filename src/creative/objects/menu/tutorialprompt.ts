import { easeInCirc, easeInQuad } from "../../../lib/engine/ease";
import { ctx, d, font, h, since, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { UI_LAYER } from "../../../lib/engine/scene";
import { clamp } from "../../../lib/engine/utils";
import { HCButton } from "../../../lib/ui/hcbutton";

const BORDER_WIDTH = 5;
const BORDER_COLOR = "#664224";
const BACKGROUND_COLOR = "#ffe6b0";
const HEADING_COLOR = "#000000";
const TEXT_COLOR = "#272727";
const NOTE_COLOR = "#888888";

const OVERLAY_OPACITY = 0.6;

const WIDTH = 650;
const HEIGHT = 400;
const PADDING = 20;

const TRANSITION_TIME = 300;

// text
const HEADING = "Welcome to Konalt Creative!";
const TEXT = `It looks like it's your first time playing!\n
Would you like to play the tutorial to learn the basics, or step right into creating?\n
The tutorial will teach you about the controls, the user interface, and the rules.`;
const NOTE = "It is highly recommended to play the tutorial!";

export class TutorialPrompt extends GameObject {
    private _spawnTime = performance.now();

    tutorialButton: HCButton;
    playButton: HCButton;

    onJoinPressed: () => void = () => {};
    onTutorialPressed: () => void = () => {};

    constructor() {
        super();

        this.playButton = new HCButton();
        this.playButton.x = (w - WIDTH) / 2 + PADDING;
        this.playButton.y = (h + HEIGHT) / 2 - PADDING;
        this.playButton.font = font(20);
        this.playButton.text = "Join game";
        this.playButton.onClick = () => {
            this.onJoinPressed();
        };
        this.playButton.anchor = "bl";

        this.tutorialButton = new HCButton();
        this.tutorialButton.x = (w + WIDTH) / 2 - PADDING;
        this.tutorialButton.y = (h + HEIGHT) / 2 - PADDING;
        this.tutorialButton.font = font(30);
        this.tutorialButton.text = "Play tutorial";
        this.tutorialButton.onClick = () => {
            this.onTutorialPressed();
        };
        this.tutorialButton.anchor = "br";
    }

    private _getTransition() {
        return clamp(since(this._spawnTime) / TRANSITION_TIME);
    }

    private _transition() {
        let t = this._getTransition();
        ctx.translate(0, easeInQuad(1 - t) * h);
    }

    update(): void {
        this.tutorialButton.update();
        this.playButton.update();
    }

    draw(): void {
        let t = this._getTransition();

        d.rect(0, 0, w, h, `rgba(0,0,0,${OVERLAY_OPACITY * t})`);

        ctx.save();
        this._transition();

        d.rect(w / 2, h / 2, WIDTH + BORDER_WIDTH * 2, HEIGHT + BORDER_WIDTH * 2, BORDER_COLOR, "", 0, "cc");
        d.rect(w / 2, h / 2, WIDTH, HEIGHT, BACKGROUND_COLOR, "", 0, "cc");

        let cy = h / 2 - HEIGHT / 2 + PADDING;
        ctx.textBaseline = "top";
        d.text(w / 2, cy, HEADING, HEADING_COLOR, font(42, "bold"), "center", WIDTH - PADDING * 2);
        cy += 42 + 15;
        d.text((w - WIDTH) / 2 + PADDING, cy, TEXT, TEXT_COLOR, font(24), "left", WIDTH - PADDING * 2);

        cy = h / 2 + HEIGHT / 2 - PADDING;
        ctx.textBaseline = "bottom";

        d.text(w / 2, h / 2 + HEIGHT / 2 - PADDING - 65, NOTE, NOTE_COLOR, font(20), "center", WIDTH - PADDING * 2);

        this.playButton.draw();
        this.tutorialButton.draw();

        ctx.restore();
    }
}
