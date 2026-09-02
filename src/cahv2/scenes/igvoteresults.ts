import { easeOutQuad } from "../../lib/engine/ease";
import { h, removeTimer, startTimer, timer, timerEnd } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { lerp, sample } from "../../lib/engine/utils";
import { currentGame, currentPlayer } from "../game";
import { CAHCard, CardHeight, CardWidth } from "../objects/ui/card";
import { Particle } from "../objects/ui/ingamebackground";
import { CAHInGamePlayerSubmitCounter } from "../objects/ui/ingameplayersubmitcounter";
import { CAHInGameVoteText } from "../objects/ui/ingamevotetext";
import { CAHPlayer } from "../types";
import { blackCardReplace, whiteCardReplace } from "../utils";
import { CAHIGVoteState } from "./igvote";
import { CAHInGameBaseScene } from "./ingamebase";

export class CAHIGVoteResultsState extends CAHInGameBaseScene {
    bigCard: CAHCard;
    voteCounter: CAHInGamePlayerSubmitCounter;
    voteTitle: CAHInGameVoteText;

    voteCards: CAHCard[];

    private _voteCardsAreaWidth = 0;
    private _voteCardsAreaHeight = 0;
    private _voteCardsAreaX = 0;
    private _voteCardsAreaY = 0;

    //#region card showcase
    private _scX: number; // showcase card X
    private _scY: number; // showcase card Y
    private _scScale: number; // showcase card Scale
    //#endregion

    constructor(bgp: Particle[]) {
        super(bgp);

        this.bigCard = new CAHCard();
        this.bigCard = new CAHCard();
        if (currentGame) {
            this.bigCard.text = blackCardReplace(currentGame.currentBlackCard);
        }
        this.bigCard.x = this.leftStart + CAHIGVoteState.BigCardXOffset;
        this.bigCard.y = CAHIGVoteState.BigCardY;
        this.bigCard.scale = CAHIGVoteState.BigCardScale;
        this.bigCard.clickable = false;
        this.add(this.bigCard, UI_LAYER + 6);

        this.voteCounter = new CAHInGamePlayerSubmitCounter("Votes");
        this.voteCounter.x = this.leftStart + CAHIGVoteState.BigCardXOffset;
        this.voteCounter.y = (CAHIGVoteState.BigCardY + (CardHeight * CAHIGVoteState.BigCardScale) / 2 + h) / 2; // halfway between bottom of big card and bottom of screen
        this.voteCounter.scale = 0.85;
        this.voteCounter.overrideText = "0";
        this.voteCounter.hide(1);
        this.add(this.voteCounter, UI_LAYER + 2);

        this.voteTitle = new CAHInGameVoteText("Vote for your favourite!", "The results are in!");
        this.voteTitle.x = this.centerLine;
        this.voteTitle.y = this.voteTitle.height / 2 + 10;
        this.add(this.voteTitle, UI_LAYER + 7);

        // hopefully you never have to touch this again
        this._voteCardsAreaX =
            this.leftStart + CAHIGVoteState.BigCardXOffset + (CardWidth * CAHIGVoteState.BigCardScale) / 2 + 60;
        this._voteCardsAreaWidth =
            this.width - (CAHIGVoteState.BigCardXOffset + (CardWidth * CAHIGVoteState.BigCardScale) / 2 + 60 + 60);
        this._voteCardsAreaY = CAHIGVoteState.BigCardY - (CardHeight * CAHIGVoteState.BigCardScale) / 2;
        this._voteCardsAreaHeight = CardHeight * CAHIGVoteState.BigCardScale;

        const l = this.addLayer(UI_LAYER + 5);
        l.reverseUpdate = true;

        this.voteCards = [];
        if (currentGame) {
            // create votable cards from players
            let i = 0;

            const cardsX = 4;
            const cardsY = 2;
            const spanX = this._voteCardsAreaWidth - CardWidth * CAHIGVoteState.VoteCardScale;
            const spanY = this._voteCardsAreaHeight - CardHeight * CAHIGVoteState.VoteCardScale;
            const incrementX = spanX / (cardsX - 1);
            const incrementY = spanY / (cardsY - 1);

            let dx = 0;
            let dy = 0;

            const placeholderCards = false;

            // worst for loop ever award
            for (const [_, ply] of placeholderCards
                ? new Array(8)
                      .fill(0)
                      .map(
                          (_) =>
                              ["", { chosenWhiteCard: whiteCardReplace(sample(window.cardsWhite)), id: "" }] as const,
                      )
                : currentGame.players) {
                const card = new CAHCard();
                card.text = whiteCardReplace(ply.chosenWhiteCard);
                card.isWhite = true;
                card.fontSizeFactor = 1.2;
                card.scale = CAHIGVoteState.VoteCardScale;
                card.clickable = false;

                // user stuff
                card.user.index = i;
                card.user.submitterId = ply.id;
                card.user.showcasing = false;
                card.user.showcaseEnding = false;

                card.user.voted = ply.id == currentPlayer.voteTarget;
                if (card.user.voted) {
                    card.scale = CAHIGVoteState.VoteCardScale * 1.2;
                } else {
                    card.setFlip(1);
                    card.scale = CAHIGVoteState.VoteCardScale * 0.8;
                }

                card.user.ox = this._voteCardsAreaX + (CardWidth * CAHIGVoteState.VoteCardScale) / 2 + dx;
                card.user.oy = this._voteCardsAreaY + (CardHeight * CAHIGVoteState.VoteCardScale) / 2 + dy;
                card.user.os = card.scale;

                card.x = card.user.ox;
                card.y = card.user.oy;

                console.log(card);
                this.voteCards.push(card);
                this.add(card, UI_LAYER + 5);
                i++;

                dx += incrementX;
                if (dx > spanX) {
                    dx = 0;
                    dy += incrementY;
                }
            }
        }

        this._scScale = 0.8;
        this._scX =
            this.leftStart +
            CAHIGVoteState.BigCardXOffset +
            (CardWidth * CAHIGVoteState.BigCardScale) / 2 +
            30 +
            (CardWidth * this._scScale) / 2;
        this._scY = this.voteCounter.y;
    }

    update() {
        this._updateCards();

        timerEnd("showcase_showvotes", () => {
            this.voteCounter.show();
        });

        timerEnd("showcase_end", () => {
            this.voteCounter.hide();
            if (this._currentShowcaseCard) {
                this._currentShowcaseCard.user.showcaseEnding = true;
            }
            startTimer("showcase_end_slide", 300);
        });

        super.update();
    }

    private _updateCards() {
        for (const card of this.voteCards) {
            if (card.user.showcasing) {
                if (!card.user.showcaseEnding) {
                    // the timer
                    const t = timer("showcase_start", true);

                    // intro animation
                    card.x = lerp(easeOutQuad(t), card.user.ox, this._scX);
                    card.y = lerp(easeOutQuad(t), card.user.oy, this._scY);
                    card.scale = lerp(easeOutQuad(t), card.user.os, this._scScale);
                } else {
                    // the timer
                    const t = timer("showcase_end_slide", true);

                    // outro (slide offscreen)
                    card.y = lerp(easeOutQuad(t), this._scY, h + (CardHeight * this._scScale) / 2 + 10);

                    // on end, remove timer and make sure this card doesnt reappear
                    timerEnd("showcase_end_slide", () => {
                        card.user.showcasing = false;
                        card.enabled = false;

                        // remove the other timer
                        removeTimer("showcase_start");
                    });
                }
            }
        }
    }

    async init(a: any) {
        await super.init(a);

        this.voteTitle.flip();
    }

    // advancing and stuff

    private _currentShowcasePlayer: CAHPlayer | null = null;
    private _currentShowcaseCard: CAHCard | null = null;

    advance(id: string, duration: number) {
        const card = this.voteCards.find((c) => c.user.submitterId == id);
        if (!card) {
            // we dont ??? have one???
            console.log(`no card found for player ${id}`);
            return;
        }

        const player = currentGame.players.get(id);
        if (!player) {
            // we dont have one of these either
            console.log(`no player found for id ${id}`);
            return;
        }

        this._currentShowcaseCard = card;
        this._currentShowcasePlayer = player;

        card.user.showcasing = true;
        card.flipFaceUp();

        this.voteCounter.overrideText = player.votesReceived.toString();

        startTimer("showcase_start", 200);
        startTimer("showcase_showvotes", 1000);
        startTimer("showcase_end", duration - 1000);
        startTimer("showcase_total", duration);
    }
}
