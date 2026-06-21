import { easeOutCirc, easeOutQuad } from "../../lib/engine/ease";
import { deltaTime, h, startTimer, timer, w } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { lerp } from "../../lib/engine/utils";
import { CAHTextInput } from "../objects/ui/cahinput";
import { CAHCard } from "../objects/ui/card";
import { CAHMenuTitle } from "../objects/ui/menutitle";
import { CAHMenuBaseScene } from "./menubase";

export class CAHMainMenuScene extends CAHMenuBaseScene {
    title: CAHMenuTitle;
    roomCodeInput: CAHTextInput;

    testCard: CAHCard;

    constructor() {
        super();

        this.title = new CAHMenuTitle();
        this.add(this.title, UI_LAYER);

        this.roomCodeInput = new CAHTextInput();
        this.roomCodeInput.x = w + 300;
        this.roomCodeInput.y = 500;
        this.roomCodeInput.placeholder = "Room Code...";
        this.roomCodeInput.font = "32px monospace";
        this.roomCodeInput.onTextUpdate = (t) => {
            if (!t.match(/^[A-Za-z]{0,6}$/)) return false;
            return t.toUpperCase();
        };
        this.add(this.roomCodeInput, UI_LAYER);

        this.testCard = new CAHCard();
        this.testCard.text = "hello";
        this.testCard.x = w * 0.8;
        this.testCard.y = h / 2;
        this.testCard.onClick = () => {
            this.testCard.flip();
        };
        this.add(this.testCard, UI_LAYER);
    }

    update(): void {
        super.update();
        this.roomCodeInput.x = lerp(easeOutQuad(timer("roomcode_slide", true)), w + 300, w / 2);
        this.roomCodeInput.needsUpdate = true;
    }

    async init() {
        await super.init();
        startTimer("roomcode_slide", 500);
    }
}
