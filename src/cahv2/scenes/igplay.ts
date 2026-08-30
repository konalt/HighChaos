import { d } from "../../lib/engine/engine";
import { Layer } from "../../lib/engine/layer";
import { UI_LAYER } from "../../lib/engine/scene";
import { randint, sample } from "../../lib/engine/utils";
import { currentGame, currentPlayer } from "../game";
import { CAHCard, CardHeight, CardWidth } from "../objects/ui/card";
import { Particle } from "../objects/ui/ingamebackground";
import { blackCardReplace, whiteCardReplace } from "../utils";
import { CAHInGameBaseScene } from "./ingamebase";

const BigCardGap = 850;
const BigCardScale = 1.15;

const CardScale = 0.85;
const CardGap = -200;
const CardHoverGap = 0.6;
const CardY = 1080 - 60 - (CardScale / 2) * CardHeight;
const CardLayerID = UI_LAYER + 3;
const CardHighlightLayerID = UI_LAYER + 4;
const HandRadius = 1400;
const HandY = 2300;

export class CAHIGPlayState extends CAHInGameBaseScene {
    // 👀
    bigBlackCard: CAHCard;
    playableCards: CAHCard[];
    highlightPlayableCard: CAHCard;

    constructor(bgp: Particle[]) {
        super(bgp);

        this.reverseUpdate = true;

        this.bigBlackCard = new CAHCard();
        this.bigBlackCard.text = blackCardReplace("Big boner down the %%%.");
        if (currentGame) {
            this.bigBlackCard.text = blackCardReplace(currentGame.currentBlackCard);
        }
        this.bigBlackCard.scale = BigCardScale;
        this.bigBlackCard.clickable = false;
        this.add(this.bigBlackCard, UI_LAYER + 2);

        // add custom card layer
        const cardLayer = this.addLayer(CardLayerID);
        cardLayer.reverseUpdate = true;

        this.playableCards = [];
        if (currentPlayer) {
            this._initCards(currentPlayer.cardsWhite);
        }

        const cardHighlightLayer = this.addLayer(CardHighlightLayerID);
        cardHighlightLayer.reverseUpdate = true;

        this.highlightPlayableCard = new CAHCard();
        this.highlightPlayableCard.text = "?";
        this.highlightPlayableCard.scale = CardScale;
        this.highlightPlayableCard.isWhite = true;
        this.highlightPlayableCard.clickable = false;
        this.highlightPlayableCard.hoverAnimationSpeed = 0;
        this.highlightPlayableCard.user.reference = null;
        this.add(this.highlightPlayableCard, CardHighlightLayerID);
    }

    private _clearCards() {
        for (const pc of this.playableCards) {
            this.remove(pc);
        }
        this.playableCards = [];
    }

    private _initCards(cards: string[]) {
        for (const cardText of cards) {
            const card = new CAHCard();
            card.text = whiteCardReplace(cardText);
            card.isWhite = true;
            card.scale = CardScale;
            card.onClick = () => {
                card.flip();
            };
            card.hoverAnimationSpeed = 15;
            this.playableCards.push(card);
            this.add(card, CardLayerID);
        }
    }

    private _updateCards() {
        let totalArc = 0;
        let addArc = 0.1;
        let hoverArc = 0;

        for (const pc of this.playableCards) {
            let thisHoverArc = pc._hoverTransition * hoverArc;
            pc.user.theta = totalArc + addArc + thisHoverArc / 2 - addArc / 2;
            totalArc += addArc + thisHoverArc;
        }

        // loop through AGAIIIIN lolw
        this.highlightPlayableCard._hoverTransition = 0;
        this.highlightPlayableCard.visible = false;
        for (const pc of this.playableCards) {
            let theta = pc.user.theta - totalArc / 2 - Math.PI / 2;
            let rad = HandRadius + pc._hoverTransition * 70;
            pc.x = Math.cos(theta) * rad + this.centerLine;
            pc.y = Math.sin(theta) * rad + HandY;
            pc.rotation = theta + Math.PI / 2;

            if (pc._hovered) {
                pc.visible = false;

                this.highlightPlayableCard.visible = true;
                this.highlightPlayableCard.text = pc.text;
                this.highlightPlayableCard.x = pc.x;
                this.highlightPlayableCard.y = pc.y;
                this.highlightPlayableCard.scale = pc.scale;
                this.highlightPlayableCard.rotation = pc.rotation;
                this.highlightPlayableCard._hovered = pc._hovered;
                this.highlightPlayableCard._hoverTransition = pc._hoverTransition;
                this.highlightPlayableCard.setFlip(pc._flip);
                this.highlightPlayableCard.user.reference = pc;
            } else {
                pc.visible = true;
            }
        }
    }

    update(): void {
        super.update();

        this.bigBlackCard.x = this.centerLine - BigCardGap / 2;
        this.bigBlackCard.y = this.tlerp(-400, 340);

        this._updateCards();
    }

    draw() {
        super.draw();

        //d.circ(this.centerLine, HandY, HandRadius, "transparent", "red", 2);
    }
}
