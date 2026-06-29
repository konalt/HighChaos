import { Socket } from "socket.io-client";
import { easeOutCirc, easeOutQuad } from "../../lib/engine/ease";
import { debugMode, h, startTimer, timer, w } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { lerp } from "../../lib/engine/utils";
import { initialize } from "../network";
import { CAHTextInput } from "../objects/ui/cahinput";
import { CAHCard } from "../objects/ui/card";
import { CAHMenuTitle } from "../objects/ui/menutitle";
import { CAHMenuBaseScene } from "./menubase";
import { API_URL } from "../utils";
import { CAHGame, deserializeGame } from "../types";
import { currentGame, setGame } from "../game";

const CardCenterGap = 600;
const CardY = 750;
const CardScale = 1;

export class CAHMainMenuScene extends CAHMenuBaseScene {
    title: CAHMenuTitle;
    roomCodeInput: CAHTextInput;

    joinGameCard: CAHCard;
    createGameCard: CAHCard;

    socket: Socket | null = null;

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
        this.joinGameCard.y = CardY;
        this.joinGameCard.scale = CardScale;
        this.joinGameCard.onClick = () => {
            this.joinGameCard.flip();
            this.transitionToScene(new CAHMenuBaseScene());
        };
        this.add(this.joinGameCard, UI_LAYER + 1);

        this.createGameCard = new CAHCard();
        this.createGameCard.text = "Create Game";
        this.createGameCard.x = w / 2 + CardCenterGap / 2;
        this.createGameCard.y = CardY;
        this.createGameCard.isWhite = true;
        this.createGameCard.scale = CardScale;
        this.createGameCard.onClick = () => {
            this._createGame();
        };
        this.add(this.createGameCard, UI_LAYER);
    }

    private async _toLobby() {
        // TRANSITION TO LOBBY STATE
        console.log("lets go to tha lobby");
        console.log(currentGame);
    }

    private async _createGame() {
        this.joinGameCard.clickable = false;
        this.createGameCard.clickable = false;

        try {
            const { code, token } = await fetch(API_URL("/game/create"), {
                method: "POST",
            }).then((r) => r.json());

            if (debugMode) this.error.show(`${code}, ${token}`);

            return new Promise<CAHGame>(async (resolve, reject) => {
                const socket = await initialize();
                this.socket = socket;

                socket.emit("join_game", code, token, (response: string) => {
                    const [responseType, responseData] = response.split("\uE000");
                    if (responseType != "OK") {
                        reject(response);
                        return;
                    }
                    const game = deserializeGame(responseData);
                    setGame(game);
                    this._toLobby();
                });
            });
        } catch (e: any) {
            console.error(e);

            this.error.show(e);

            this.joinGameCard.clickable = true;
            this.createGameCard.clickable = true;
        }
    }

    update(): void {
        super.update();

        // card sliding
        this.joinGameCard.x = lerp(easeOutQuad(timer("joincard_slide")), -200, w / 2 - CardCenterGap / 2);
        this.createGameCard.x = lerp(easeOutQuad(timer("joincard_slide")), w + 200, w / 2 + CardCenterGap / 2);
        //this.roomCodeInput.x = lerp(easeOutQuad(timer("roomcode_slide", true)), w + 300, w / 2);
        //this.roomCodeInput.needsUpdate = true;
    }

    async init() {
        await super.init();
        setTimeout(() => {
            startTimer("joincard_slide", 500);
        }, 1000);
    }
}
