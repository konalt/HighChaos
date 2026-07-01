import { h } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { currentGame } from "../game";
import { CAHLobbyCodeDisplay } from "../objects/ui/lobbycodedisplay";
import { CAHInGameBaseScene } from "./ingamebase";

export class CAHIGLobbyState extends CAHInGameBaseScene {
    codeDisplay: CAHLobbyCodeDisplay;

    constructor() {
        super();

        this.codeDisplay = new CAHLobbyCodeDisplay();
        this.codeDisplay.y = 200;
        if (currentGame) {
            this.codeDisplay.code = currentGame.code;
        }
        this.add(this.codeDisplay, UI_LAYER + 10);
    }

    update(): void {
        this.codeDisplay.x = this.centerLine;

        super.update();
    }
}
