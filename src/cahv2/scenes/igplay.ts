import { easeInOutBack, easeOutQuad } from "../../lib/engine/ease";
import { d, globalTimer, startTimer, timer, w } from "../../lib/engine/engine";
import { Layer } from "../../lib/engine/layer";
import { UI_LAYER } from "../../lib/engine/scene";
import { playSound } from "../../lib/engine/sound";
import { lerp, randint, sample } from "../../lib/engine/utils";
import { currentGame, currentPlayer } from "../game";
import { socket } from "../network";
import { CAHCard, CardHeight, CardWidth } from "../objects/ui/card";
import { Particle } from "../objects/ui/ingamebackground";
import { CAHInGamePlayerSubmitCounter } from "../objects/ui/ingameplayersubmitcounter";
import { blackCardReplace, whiteCardReplace } from "../utils";
import { CAHIGVoteState } from "./igvote";
import { CAHInGameBaseScene } from "./ingamebase";

export const BigCardGap = 850;
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

    playerSubmitCounter: CAHInGamePlayerSubmitCounter;

    canPlay = true;

    setCanPlay(s: boolean) {
        this.canPlay = s;

        for (const pc of this.playableCards) {
            pc.clickable = false;
        }

        startTimer("canplaytoggle", 200);
    }

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
        this.add(this.bigBlackCard, UI_LAYER + 5);

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

        this.playerSubmitCounter = new CAHInGamePlayerSubmitCounter("Players Ready");
        if (currentGame) {
            this.playerSubmitCounter.updateTotalPlayers();
        }
        this.add(this.playerSubmitCounter, UI_LAYER + 2);
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
                playSound("cards/slip", 0.7);
                //card.flip();
                this.submitCard(card.user.index);
            };
            card.user.index = this.playableCards.length;
            card.hoverAnimationSpeed = 15;
            this.playableCards.push(card);
            this.add(card, CardLayerID);
        }
    }

    private _updateCards() {
        let totalArc = 0;
        let addArc = 0.1;
        let hoverArc = 0;

        let i = 0;
        for (const pc of this.playableCards) {
            let thisHoverArc = pc._hoverTransition * hoverArc;

            let mult = 1;
            if (i == this._submittedCardIndex) mult = easeOutQuad(1 - timer("cardsubmit", true));

            pc.user.theta = totalArc + (addArc / 2 + thisHoverArc / 2) * mult;
            totalArc += (addArc + thisHoverArc) * mult;
            i++;
        }

        // loop through AGAIIIIN lolw
        i = 0;
        this.highlightPlayableCard._hoverTransition = 0;
        this.highlightPlayableCard.visible = false;
        for (const pc of this.playableCards) {
            let theta = pc.user.theta - totalArc / 2 - Math.PI / 2;
            let rad = HandRadius + pc._hoverTransition * 70;
            rad -= this.tlerp(CardHeight, 0); // in/out transition effect
            rad -= lerp(easeOutQuad(timer("canplaytoggle", true)) * (this.canPlay ? -1 : 1), 0, CardHeight / 2); // play ability effect

            if (i == this._submittedCardIndex) {
                // this card has been submitted we need to move it to the right place
                // calculate origin coords
                const ox = Math.cos(theta) * rad + this.centerLine;
                const oy = Math.sin(theta) * rad + HandY;
                const or = theta + Math.PI / 2;

                // calculate interpolated destination coords
                // interpolate it
                const t = timer("cardsubmit", true);
                const dx = lerp(easeOutQuad(t), ox, this.centerLine);
                const dy = lerp(easeOutQuad(t), oy, 340);
                const dr = lerp(easeInOutBack(t), or, 0);
                const ds = lerp(t, CardScale, BigCardScale);

                // ending transition (moving into the big card) must be tlerped
                pc.x = this.tlerp(this.bigBlackCard.x, dx);
                pc.y = this.tlerp(this.bigBlackCard.y, dy);
                pc.rotation = dr; // doesnt need to be transitioned, its already 0
                pc.scale = this.tlerp(0.2, ds); // 1 is small compared to bigcard

                // this always has to be visible
                pc.visible = true;
            } else {
                pc.x = Math.cos(theta) * rad + this.centerLine;
                pc.y = Math.sin(theta) * rad + HandY;
                pc.rotation = theta + Math.PI / 2;
                pc.scale = CardScale;

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
            i++;
        }
    }

    update(): void {
        super.update();

        // big black card x
        const bbcx = this.centerLine - BigCardGap / 2;
        this.bigBlackCard.x = this.tlerp(bbcx, bbcx, this.leftStart + CAHIGVoteState.BigCardXOffset);
        this.bigBlackCard.y = this.tlerp(-400, 340, CAHIGVoteState.BigCardY);
        this.bigBlackCard.scale = this.tlerp(1, BigCardScale, CAHIGVoteState.BigCardScale);

        // player submit counter x
        const pscx = this.centerLine + BigCardGap / 2;
        this.playerSubmitCounter.x = this.tlerp(w + 300, pscx, pscx);
        this.playerSubmitCounter.y = 340;

        this._updateCards();
    }

    draw() {
        super.draw();
    }

    //#region card submitting things
    private _submittedCardIndex = -1;

    submitCard(index: number) {
        this._submittedCardIndex = index;

        this.setCanPlay(false);

        startTimer("cardsubmit", 250);

        if (socket) {
            socket.emit("cardsubmit", currentPlayer.cardsWhite[index]);
        }
    }
    //#endregion
}
