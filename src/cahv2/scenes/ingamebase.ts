import { UI_LAYER } from "../../lib/engine/scene";
import { CAHInGameBackground } from "../objects/ui/ingamebackground";
import { CAHBaseScene } from "./base";

export class CAHInGameBaseScene extends CAHBaseScene {
    background: CAHInGameBackground;

    constructor() {
        super();

        this.background = new CAHInGameBackground();
        this.add(this.background, UI_LAYER);
    }
}
