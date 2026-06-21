import { easeOutCirc, easeOutQuad } from "../../lib/engine/ease";
import { h, startTimer, timer, w } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { lerp } from "../../lib/engine/utils";
import { CAHTextInput } from "../objects/ui/cahinput";
import { CAHCard } from "../objects/ui/card";
import { CAHMenuTitle } from "../objects/ui/menutitle";
import { CAHMenuBaseScene } from "./menubase";

const CardCenterGap = 600;
const CardStartY = h + 400;
const CardY = 750;
const CardScale = 1;

export class CAHMainMenuScene extends CAHMenuBaseScene {
    title: CAHMenuTitle;
    roomCodeInput: CAHTextInput;

    joinGameCard: CAHCard;
    createGameCard: CAHCard;

    constructor() {
        super();

        this.title = new CAHMenuTitle();
        this.add(this.title, UI_LAYER + 3);

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

        this.joinGameCard = new CAHCard();
        this.joinGameCard.text = "Join Game";
        this.joinGameCard.x = w / 2 - CardCenterGap / 2;
        this.joinGameCard.y = CardStartY;
        this.joinGameCard.scale = CardScale;
        this.joinGameCard.onClick = () => {
            this.joinGameCard.flip();
        };
        this.add(this.joinGameCard, UI_LAYER + 1);

        this.createGameCard = new CAHCard();
        this.createGameCard.text = "Create Game";
        this.createGameCard.x = w / 2 + CardCenterGap / 2;
        this.createGameCard.y = CardStartY;
        this.createGameCard.isWhite = true;
        this.createGameCard.scale = CardScale;
        this.createGameCard.onClick = () => {
            this.createGameCard.flip();
        };
        this.add(this.createGameCard, UI_LAYER);
    }

    update(): void {
        super.update();

        // card sliding
        this.joinGameCard.y = lerp(easeOutQuad(timer("joincard_slide")), CardStartY, CardY);
        this.createGameCard.y = lerp(easeOutQuad(timer("joincard_slide")), CardStartY, CardY);

        this.createGameCard.x = this.joinGameCard.x + easeOutQuad(timer("createcard_slide")) * CardCenterGap;
        //this.roomCodeInput.x = lerp(easeOutQuad(timer("roomcode_slide", true)), w + 300, w / 2);
        //this.roomCodeInput.needsUpdate = true;
    }

    async init() {
        await super.init();
        setTimeout(() => {
            startTimer("joincard_slide", 500);
            setTimeout(() => {
                startTimer("createcard_slide", 500);
            }, 500);
        }, 1000);
    }
}
