import { UI_LAYER } from "../../lib/engine/scene";
import { randint } from "../../lib/engine/utils";
import { currentPlayer } from "../game";
import { CAHCard, CardHeight, CardWidth } from "../objects/ui/card";
import { Particle } from "../objects/ui/ingamebackground";
import { CAHInGameBaseScene } from "./ingamebase";

const BigCardGap = 850;
const BigCardScale = 1.15;

const CardScale = 0.6;
const CardGap = -100;
const CardHoverGap = 50;
const CardY = 1080 - 60 - (CardScale / 2) * CardHeight;

export class CAHIGPlayState extends CAHInGameBaseScene {
    // 👀
    bigBlackCard: CAHCard;
    playableCards: CAHCard[];

    constructor(bgp: Particle[]) {
        super(bgp);

        this.bigBlackCard = new CAHCard();
        this.bigBlackCard.text = "Bitches said I was testing the UI, I was actually ______.";
        this.bigBlackCard.scale = BigCardScale;
        this.bigBlackCard.clickable = false;
        this.add(this.bigBlackCard, UI_LAYER + 2);

        this.playableCards = [];
        this._initCards("abcdefg".split(""));
    }

    private _clearCards() {
        for (const pc of this.playableCards) {
            this.remove(pc);
        }
        this.playableCards = [];
    }

    private _initCards(cards: string[]) {
        let x = 0;
        for (const cardText of cards) {
            const card = new CAHCard();
            card.text = cardText;
            card.isWhite = true;
            card.scale = CardScale;
            card.onClick = () => {
                card.flip();
            };
            this.playableCards.push(card);
            this.add(card, UI_LAYER + 2);
        }
    }

    private _updateCards() {
        let totalWidth = 0;

        for (const pc of this.playableCards) {
            pc.x = totalWidth + (CardWidth * pc.scale) / 2;
            pc.y = CardY;

            const addWidth = CardWidth * pc.scale + CardGap;
            totalWidth += addWidth;
        }

        // loop through AGAIIIIN lolw
        for (const pc of this.playableCards) {
            pc.x += this.centerLine - totalWidth / 2;
        }
    }

    update(): void {
        super.update();

        this.bigBlackCard.x = this.centerLine - BigCardGap / 2;
        this.bigBlackCard.y = this.tlerp(-400, 340);

        this._updateCards();
    }
}
