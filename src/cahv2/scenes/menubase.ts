import { UI_LAYER } from "../../lib/engine/scene";
import { CAHBetterBackground } from "../objects/ui/betterbackground";
import { CAHBaseScene } from "./base";

export class CAHMenuBaseScene extends CAHBaseScene {
    background: CAHBetterBackground;

    constructor() {
        super();

        this.background = new CAHBetterBackground();
        this.add(this.background, UI_LAYER);
    }
}
