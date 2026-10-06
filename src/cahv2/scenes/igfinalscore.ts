import { h } from "../../lib/engine/engine";
import { UI_LAYER } from "../../lib/engine/scene";
import { currentGame } from "../game";
import { Particle } from "../objects/ui/ingamebackground";
import { CAHInGameFinalPodium } from "../objects/ui/ingamefinalpodium";
import { CAHInGameBaseScene } from "./ingamebase";

export class CAHIGFinalScoreState extends CAHInGameBaseScene {
    podium: CAHInGameFinalPodium;

    constructor(bgp: Particle[]) {
        super(bgp);

        this.podium = new CAHInGameFinalPodium();
        //this.podium.forceAllVisible = true;
        if (currentGame) {
            // sort the players then filter
            let array = Array.from(currentGame.players.values()).sort((a, b) => b.score - a.score);
            array = array.slice(0, 3);
            console.log(array);
            this.podium.setPlayers(array);
        }
        this.add(this.podium, UI_LAYER + 1);

        this.playerList.visible = false;
    }

    update() {
        super.update();

        this.podium.y = this.tlerp(h, 0);
    }
}
