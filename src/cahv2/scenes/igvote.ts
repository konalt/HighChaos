import { h } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { currentGame } from "../game";
import { CAHCard, CardHeight, CardWidth } from "../objects/ui/card";
import { Particle } from "../objects/ui/ingamebackground";
import { CAHInGamePlayerSubmitCounter } from "../objects/ui/ingameplayersubmitcounter";
import { CAHInGameVoteText } from "../objects/ui/ingamevotetext";
import { blackCardReplace } from "../utils";
import { CAHInGameBaseScene } from "./ingamebase";

const BigCardScale = 1.2;
const BigCardXOffset = (CardWidth * BigCardScale) / 2 + 30;
const BigCardY = 430;

export class CAHIGVoteState extends CAHInGameBaseScene {
    //#region static stuff
    static BigCardXOffset = BigCardXOffset;
    static BigCardY = BigCardY;
    static BigCardScale = BigCardScale;
    //#endregion

    bigCard: CAHCard;
    voteCounter: CAHInGamePlayerSubmitCounter;
    voteTitle: CAHInGameVoteText;

    constructor(bgp: Particle[]) {
        super(bgp);

        this.bigCard = new CAHCard();
        if (currentGame) {
            this.bigCard.text = blackCardReplace(currentGame.currentBlackCard);
        }
        this.bigCard.scale = BigCardScale;
        this.bigCard.clickable = false;
        this.add(this.bigCard, UI_LAYER + 2);

        this.voteCounter = new CAHInGamePlayerSubmitCounter("Votes Cast");
        this.voteCounter.y = (BigCardY + (CardHeight * BigCardScale) / 2 + h) / 2; // halfway between bottom of big card and bottom of screen
        this.voteCounter.scale = 0.85;
        this.add(this.voteCounter, UI_LAYER + 2);

        this.voteTitle = new CAHInGameVoteText("Vote for your favourite!");
        this.add(this.voteTitle, UI_LAYER + 6);
    }

    update(): void {
        this.bigCard.x = this.leftStart + BigCardXOffset;
        this.bigCard.y = this.tlerp(BigCardY, BigCardY, 0);
        this.bigCard.scale = this.tlerp(BigCardScale, BigCardScale, 0);

        this.voteCounter.x = this.leftStart + BigCardXOffset;

        this.voteTitle.x = this.centerLine;
        this.voteTitle.y = this.tlerp(-this.voteTitle.height, this.voteTitle.height / 2 + 10);

        super.update();
    }
}
