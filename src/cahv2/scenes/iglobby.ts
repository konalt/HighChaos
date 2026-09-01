import { easeOutQuad } from "../../lib/engine/ease";
import { h, setScene, startTimer, timer, timerEnd, w } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { lerp } from "../../lib/engine/utils";
import { currentGame, currentPlayer } from "../game";
import { socket } from "../network";
import { CAHButton } from "../objects/ui/cahbtn";
import { Particle } from "../objects/ui/ingamebackground";
import { CAHLobbyCodeDisplay } from "../objects/ui/lobbycodedisplay";
import { CAHLobbyCountdown } from "../objects/ui/lobbycountdown";
import { CAHIGPlayState } from "./igplay";
import { CAHInGameBaseScene } from "./ingamebase";

export class CAHIGLobbyState extends CAHInGameBaseScene {
    codeDisplay: CAHLobbyCodeDisplay;
    startButton: CAHButton;
    countdown: CAHLobbyCountdown;

    isStarting = false;

    constructor(bgp: Particle[]) {
        super(bgp);

        this.codeDisplay = new CAHLobbyCodeDisplay();
        this.codeDisplay.y = 200;
        if (currentGame) {
            this.codeDisplay.code = currentGame.code;
        }
        this.add(this.codeDisplay, UI_LAYER + 1);

        this.startButton = new CAHButton("Start!", 48);
        this.startButton.background = "#45b32f";
        this.startButton.border = "#44d831";
        this.startButton.anchor = "br";
        this.startButton.x = w - 20;
        this.startButton.y = h - 20;
        this.startButton.disabled = true;
        this.startButton.enabled = currentPlayer.isHost;
        this.startButton.onClick = () => {
            if (socket) {
                socket.emit("start");
            }
            //this.finish(new CAHIGPlayState(this.background.particles));
        };
        this.add(this.startButton, UI_LAYER);

        this.countdown = new CAHLobbyCountdown();
        this.add(this.countdown, UI_LAYER + 1);
    }

    update(): void {
        this.codeDisplay.x = this.centerLine;
        this.codeDisplay.y = this.tlerp(-200, 200);
        this.startButton.x = this.tlerp(w + 400, w - 20);

        // only enable start button if there are enough players
        this.startButton.disabled = currentGame.players.size < 1 || this.isStarting;

        super.update();
    }
}
