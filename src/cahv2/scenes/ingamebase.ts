import { UI_LAYER } from "../../lib/engine/scene";
import { CAHInGameBackground } from "../objects/ui/ingamebackground";
import { CAHInGamePlayerList } from "../objects/ui/ingameplayerlist";
import { CAHBaseScene } from "./base";

export class CAHInGameBaseScene extends CAHBaseScene {
    background: CAHInGameBackground;
    playerList: CAHInGamePlayerList;

    constructor() {
        super();

        this.background = new CAHInGameBackground();
        this.add(this.background, UI_LAYER);

        this.playerList = new CAHInGamePlayerList();
        this.add(this.playerList, UI_LAYER + 1);
    }
}
