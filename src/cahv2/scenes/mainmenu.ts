import { Socket } from "socket.io-client";
import { easeOutQuad } from "../../lib/engine/ease";
import { debugMode, font, h, removeTimer, startTimer, timer, timerEnd, w } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { lerp } from "../../lib/engine/utils";
import { initialize } from "../network";
import { CAHTextInput } from "../objects/ui/cahinput";
import { CAHCard } from "../objects/ui/card";
import { CAHMenuTitle } from "../objects/ui/menutitle";
import { CAHMenuBaseScene } from "./menubase";
import { API_URL } from "../utils";
import { CAHGame, deserializeGame } from "../types";
import { setGame } from "../game";
import { CAHInGameBaseScene } from "./ingamebase";
import { HCButton } from "../../lib/ui/hcbutton";
import { CAHSettingsButton } from "../objects/ui/settingsbtn";
import { CAHSettingsScene } from "./settings";

const CardCenterGap = 600;
const CardY = 750;
const CardScale = 1;

const RoomCodeCardGap = 400;
const RoomCodeCardY = 750;
const RoomCodeButtonYOffset = 175;

const TransitionDuration = 400;

export class CAHMainMenuScene extends CAHMenuBaseScene {
    title: CAHMenuTitle;

    roomCodeCard: CAHCard;
    roomCodeBackCard: CAHCard;
    roomCodeInput: CAHTextInput;
    roomCodeJoinButton: HCButton;

    joinGameCard: CAHCard;
    createGameCard: CAHCard;

    settingsButton: CAHSettingsButton;

    socket: Socket | null = null;

    private _isTransitioning = false;

    constructor() {
        super();

        this.title = new CAHMenuTitle();
        this.add(this.title, UI_LAYER + 3);

        this.joinGameCard = new CAHCard();
        this.joinGameCard.text = "Join Game";
        this.joinGameCard.x = -200;
        this.joinGameCard.y = CardY;
        this.joinGameCard.scale = CardScale;
        this.joinGameCard.onClick = () => {
            this._setCardsEnabled(false);
            startTimer("joincard_slide_out", TransitionDuration);
            startTimer("roomcode_slide", TransitionDuration);
            this._isTransitioning = true;
        };
        this.add(this.joinGameCard, UI_LAYER + 1);

        this.createGameCard = new CAHCard();
        this.createGameCard.text = "Create Game";
        this.createGameCard.x = w + 200;
        this.createGameCard.y = CardY;
        this.createGameCard.isWhite = true;
        this.createGameCard.scale = CardScale;
        this.createGameCard.onClick = () => {
            this._createGame();
        };
        this.add(this.createGameCard, UI_LAYER);

        this.roomCodeBackCard = new CAHCard();
        this.roomCodeBackCard.text = "Back to main menu";
        this.roomCodeBackCard.x = w / 2 - RoomCodeCardGap / 2;
        this.roomCodeBackCard.y = h + 300;
        this.roomCodeBackCard.isWhite = false;
        this.roomCodeBackCard.scale = CardScale * 0.8;
        this.roomCodeBackCard.onClick = () => {
            this._setCardsEnabled(true);
            startTimer("roomcode_slide_out", TransitionDuration);
            startTimer("joincard_slide", TransitionDuration);
            this._isTransitioning = true;
        };
        this.add(this.roomCodeBackCard, UI_LAYER);

        this.roomCodeCard = new CAHCard();
        this.roomCodeCard.text = "Enter the game code:";
        this.roomCodeCard.x = w / 2 + RoomCodeCardGap / 2;
        this.roomCodeCard.y = h + 300;
        this.roomCodeCard.isWhite = true;
        this.roomCodeCard.scale = CardScale;
        this.roomCodeCard.clickable = false;
        this.add(this.roomCodeCard, UI_LAYER);

        this.roomCodeInput = new CAHTextInput();
        this.roomCodeInput.x = this.roomCodeCard.x;
        this.roomCodeInput.y = this.roomCodeCard.y;
        this.roomCodeInput.placeholder = "ABCDEF";
        this.roomCodeInput.font = "64px monospace";
        this.roomCodeInput.onTextUpdate = (t) => {
            if (!t.match(/^[A-Za-z]{0,6}$/)) return false;
            return t.toUpperCase();
        };
        this.add(this.roomCodeInput, UI_LAYER);

        this.roomCodeJoinButton = new HCButton();
        this.roomCodeJoinButton.x = this.roomCodeCard.x;
        this.roomCodeJoinButton.y = this.roomCodeCard.y + RoomCodeButtonYOffset;
        this.roomCodeJoinButton.text = "Join!";
        this.roomCodeJoinButton.font = font(48);
        this.roomCodeJoinButton.invert = false;
        this.roomCodeJoinButton.onClick = async () => {
            const code = this.roomCodeInput.value;

            if (!code) {
                this.error.show("Please click on the input box to enter a game code.");
                return;
            }

            if (code.length != 6) {
                this.error.show("Game code must be 6 letters long.");
                return;
            }

            this.roomCodeJoinButton.enabled = false;

            const check = await this._checkGameCode(code);

            if (!check) {
                this.roomCodeJoinButton.enabled = true;
                return;
            }

            // we can join the game
            this._joinGame(code);
        };
        this.add(this.roomCodeJoinButton, UI_LAYER);

        this.settingsButton = new CAHSettingsButton();
        this.settingsButton.onClick = () => {
            this.transitionToScene(new CAHSettingsScene());
        };
        this.add(this.settingsButton, UI_LAYER);
    }

    private _setCardsEnabled(e: boolean) {
        this.joinGameCard.clickable = e;
        this.createGameCard.clickable = e;
        /* if (e) {
            this.joinGameCard.flipFaceUp();
            this.createGameCard.flipFaceUp();
        } else {
            this.joinGameCard.flipFaceDown();
            this.createGameCard.flipFaceDown();
        } */
    }

    private async _toLobby() {
        // TRANSITION TO LOBBY STATE
        this.transitionToScene(new CAHInGameBaseScene());
    }

    private async _checkGameCode(code: string) {
        try {
            const msg = await fetch(API_URL("/game/check/" + code), {
                signal: AbortSignal.timeout(2000),
            }).then((r) => r.text());
            console.log(`game check: ${msg}`);

            switch (msg) {
                case "OK":
                    return true;
                case "GameNotFound":
                    throw "Game not found!";
                case "GameFull":
                    throw "That game is full!";
                case "GameInProgress":
                    throw "That game is in progress! Spectating will be added in a future update :3";
                default:
                    throw `An unknown error occurred: ${msg}`;
            }
        } catch (e: any) {
            console.error(e);
            this.error.show(e);
            return false;
        }
    }

    private async _createGame() {
        this._setCardsEnabled(false);
        try {
            const { code, token } = await fetch(API_URL("/game/create"), {
                method: "POST",
                signal: AbortSignal.timeout(2000),
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
                    resolve(game);
                });
            });
        } catch (e: any) {
            console.error(e);

            this.error.show(e);

            this._setCardsEnabled(true);
        }
    }

    private async _joinGame(code: string) {
        return new Promise<CAHGame>(async (resolve, reject) => {
            const socket = await initialize();
            this.socket = socket;

            socket.emit("join_game", code, "", (response: string) => {
                const [responseType, responseData] = response.split("\uE000");
                if (responseType != "OK") {
                    reject(response);
                    return;
                }
                const game = deserializeGame(responseData);
                setGame(game);
                this._toLobby();
                resolve(game);
            });
        });
    }

    update(): void {
        super.update();

        // card sliding
        if (timer("joincard_slide")) {
            this.joinGameCard.x = lerp(easeOutQuad(timer("joincard_slide")), -200, w / 2 - CardCenterGap / 2);
            this.createGameCard.x = lerp(easeOutQuad(timer("joincard_slide")), w + 200, w / 2 + CardCenterGap / 2);
        }
        if (timer("joincard_slide_out")) {
            this.joinGameCard.x = lerp(1 - easeOutQuad(timer("joincard_slide_out")), -200, w / 2 - CardCenterGap / 2);
            this.createGameCard.x = lerp(
                1 - easeOutQuad(timer("joincard_slide_out")),
                w + 200,
                w / 2 + CardCenterGap / 2,
            );
        }

        if (timer("roomcode_slide")) {
            this.roomCodeCard.y = lerp(easeOutQuad(timer("roomcode_slide", true)), h + 300, RoomCodeCardY);
        }
        if (timer("roomcode_slide_out")) {
            this.roomCodeCard.y = lerp(1 - easeOutQuad(timer("roomcode_slide_out", true)), h + 300, RoomCodeCardY);
        }

        const stopTransition = () => {
            this._isTransitioning = false;
        };
        timerEnd("roomcode_slide", stopTransition);
        timerEnd("roomcode_slide_out", stopTransition);
        timerEnd("joincard_slide", stopTransition);
        timerEnd("joincard_slide_out", stopTransition);

        this.roomCodeBackCard.y = this.roomCodeCard.y;
        this.roomCodeJoinButton.y = this.roomCodeCard.y + RoomCodeButtonYOffset;
        this.roomCodeInput.y = this.roomCodeCard.y - 10;
        if (this._isTransitioning) {
            this.roomCodeJoinButton.needsUpdate = true;
            this.roomCodeInput.needsUpdate = true;
        }
    }

    async init(data: any) {
        removeTimer("roomcode_slide");
        removeTimer("joincard_slide");
        if (data.skipIntro) {
            this.title.skipIntro = true;
            startTimer("joincard_slide", 1);
        } else {
            setTimeout(() => {
                startTimer("joincard_slide", TransitionDuration);
            }, 1000);
        }

        await super.init(data);
    }
}
