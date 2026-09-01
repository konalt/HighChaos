import { easeOutQuad } from "../../lib/engine/ease";
import { h, removeTimer, startTimer, timer, timerEnd } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { playSound } from "../../lib/engine/sound";
import { lerp, sample } from "../../lib/engine/utils";
import { HCRect } from "../../lib/ui/hcrect";
import { currentGame } from "../game";
import { socket } from "../network";
import { CAHCard, CardHeight, CardWidth } from "../objects/ui/card";
import { Particle } from "../objects/ui/ingamebackground";
import { CAHInGamePlayerSubmitCounter } from "../objects/ui/ingameplayersubmitcounter";
import { CAHInGameVoteText } from "../objects/ui/ingamevotetext";
import { blackCardReplace, whiteCardReplace } from "../utils";
import { CAHInGameBaseScene } from "./ingamebase";

const BigCardScale = 1.2;
const BigCardXOffset = (CardWidth * BigCardScale) / 2 + 30;
const BigCardY = 430;

const VoteCardScale = 0.58;
const VoteCardInterval = 100;

export class CAHIGVoteState extends CAHInGameBaseScene {
    //#region static stuff
    static BigCardXOffset = BigCardXOffset;
    static BigCardY = BigCardY;
    static BigCardScale = BigCardScale;
    //#endregion

    bigCard: CAHCard;
    voteCounter: CAHInGamePlayerSubmitCounter;
    voteTitle: CAHInGameVoteText;

    voteCards: CAHCard[];

    private _voteCardsAreaWidth = 0;
    private _voteCardsAreaHeight = 0;
    private _voteCardsAreaX = 0;
    private _voteCardsAreaY = 0;

    constructor(bgp: Particle[]) {
        super(bgp);

        this.bigCard = new CAHCard();
        if (currentGame) {
            this.bigCard.text = blackCardReplace(currentGame.currentBlackCard);
        }
        this.bigCard.x = this.leftStart + BigCardXOffset;
        this.bigCard.y = BigCardY;
        this.bigCard.scale = BigCardScale;
        this.bigCard.clickable = false;
        this.add(this.bigCard, UI_LAYER + 6);

        this.voteCounter = new CAHInGamePlayerSubmitCounter("Votes Cast");
        this.voteCounter.x = this.leftStart + BigCardXOffset;
        this.voteCounter.y = (BigCardY + (CardHeight * BigCardScale) / 2 + h) / 2; // halfway between bottom of big card and bottom of screen
        this.voteCounter.scale = 0.85;
        if (currentGame) {
            this.voteCounter.updateTotalPlayers();
        }
        this.add(this.voteCounter, UI_LAYER + 2);

        this.voteTitle = new CAHInGameVoteText("Vote for your favourite!");
        this.add(this.voteTitle, UI_LAYER + 7);

        // hopefully you never have to touch this again
        this._voteCardsAreaX = this.leftStart + BigCardXOffset + (CardWidth * BigCardScale) / 2 + 60;
        this._voteCardsAreaWidth = this.width - (BigCardXOffset + (CardWidth * BigCardScale) / 2 + 60 + 60);
        this._voteCardsAreaY = BigCardY - (CardHeight * BigCardScale) / 2;
        this._voteCardsAreaHeight = CardHeight * BigCardScale;

        const l = this.addLayer(UI_LAYER + 5);
        l.reverseUpdate = true;

        this.voteCards = [];
        if (currentGame) {
            // create votable cards from players
            let i = 0;

            const cardsX = 4;
            const cardsY = 2;
            const spanX = this._voteCardsAreaWidth - CardWidth * VoteCardScale;
            const spanY = this._voteCardsAreaHeight - CardHeight * VoteCardScale;
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
                card.text = ply.chosenWhiteCard;
                card.isWhite = true;
                card.fontSizeFactor = 1.2;
                card.scale = VoteCardScale;
                card.clickable = false;

                // user stuff
                card.user.index = i;
                card.user.submitterId = ply.id;
                card.user.ox = this.bigCard.x;
                card.user.oy = this.bigCard.y;
                card.user.dx = this._voteCardsAreaX + (CardWidth * VoteCardScale) / 2 + dx;
                card.user.dy = this._voteCardsAreaY + (CardHeight * VoteCardScale) / 2 + dy;
                card.user.voted = false;

                card.x = card.user.ox;
                card.y = card.user.oy;

                card.onClick = () => {
                    this.voteCard(card.user.index);
                };

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

        /* const r = new HCRect();
        r.x = this._voteCardsAreaX;
        r.y = this._voteCardsAreaY;
        r.w = this._voteCardsAreaWidth;
        r.h = this._voteCardsAreaHeight;
        r.color = "rgba(128,128,255,0.5)";
        this.add(r, UI_LAYER + 20); */
    }

    update(): void {
        this.bigCard.x = this.leftStart + BigCardXOffset;
        this.bigCard.y = this.tlerp(BigCardY, BigCardY, 0);
        this.bigCard.scale = this.tlerp(BigCardScale, BigCardScale, 0);

        this.voteTitle.x = this.centerLine;
        this.voteTitle.y = this.tlerp(-this.voteTitle.height, this.voteTitle.height / 2 + 10);

        this._updateInterval();
        this._updateVoteCards();

        super.update();
    }

    private _updateVoteCards() {
        for (const card of this.voteCards) {
            const index = card.user.index;
            const ox = card.user.ox;
            const oy = card.user.oy;
            const dx = card.user.dx;
            const dy = card.user.dy;

            const t = timer(`cardappear${index}`, true);

            card.x = lerp(easeOutQuad(t), ox, dx);
            card.y = lerp(easeOutQuad(t), oy, dy);

            if (this._votedCardIndex != -1) {
                if (card.user.voted) {
                    // make the card slightly bigger
                    const transitionScale = lerp(easeOutQuad(timer("voted", true)), 1, 1.1);
                    card.scale = VoteCardScale * transitionScale;
                } else {
                    // make the card slightly smaller
                    const transitionScale = lerp(easeOutQuad(timer("voted", true)), 1, 0.8);
                    card.scale = VoteCardScale * transitionScale;
                }
            }
        }
    }

    private _curIntervalIndex = 0;
    private _updateInterval() {
        timerEnd(
            "cardinterval",
            () => {
                // if its the first one
                /* if (this._curIntervalIndex == 0) {
                    playSound("cards/shuffle");
                } */

                console.log(`showing card ${this._curIntervalIndex}`);

                playSound("cards/slip", 0.3);
                startTimer(`cardappear${this._curIntervalIndex}`, 200);

                this._curIntervalIndex++;

                if (this._curIntervalIndex < this.voteCards.length) {
                    startTimer("cardinterval", VoteCardInterval);
                    console.log(`starting another timer`);
                } else {
                    console.log(`done showing cards`);

                    // enable all cards
                    for (const card of this.voteCards) {
                        card.clickable = true;
                    }

                    removeTimer("cardinterval");
                }
            },
            false,
        );
    }

    async init(a: any) {
        await super.init(a);

        startTimer("cardinterval", VoteCardInterval);
    }

    //#region voting
    private _votedCardIndex = -1;
    voteCard(index: number) {
        this._votedCardIndex = index;

        let i = 0;
        for (const card of this.voteCards) {
            card.clickable = false;

            if (i == index) {
                card.user.voted = true;
            } else {
                card.flipFaceDown();
            }
            i++;
        }

        startTimer("voted", 200);

        playSound("cards/slip");

        if (socket) {
            socket.emit("vote", this.voteCards[index].user.submitterId);
        }
    }
    //#endregion
}
