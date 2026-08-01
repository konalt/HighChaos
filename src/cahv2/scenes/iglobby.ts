import { h, w } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { currentGame, currentPlayer } from "../game";
import { CAHButton } from "../objects/ui/cahbtn";
import { CAHLobbyCodeDisplay } from "../objects/ui/lobbycodedisplay";
import { CAHInGameBaseScene } from "./ingamebase";

export class CAHIGLobbyState extends CAHInGameBaseScene {
    codeDisplay: CAHLobbyCodeDisplay;
    startButton: CAHButton;

    constructor() {
        super();

        this.codeDisplay = new CAHLobbyCodeDisplay();
        this.codeDisplay.y = 200;
        if (currentGame) {
            this.codeDisplay.code = currentGame.code;
        }
        this.add(this.codeDisplay, UI_LAYER + 10);

        this.startButton = new CAHButton("Start!", 48);
        this.startButton.background = "#45b32f";
        this.startButton.border = "#44d831";
        this.startButton.anchor = "br";
        this.startButton.x = w - 20;
        this.startButton.y = h - 20;
        this.startButton.disabled = true;
        this.startButton.enabled = currentPlayer.isHost;
        this.add(this.startButton, UI_LAYER);
    }

    update(): void {
        this.codeDisplay.x = this.centerLine;

        // only enable start button if there are enough players
        this.startButton.disabled = currentGame.players.size < 2;

        super.update();
    }
}
