import { UI_LAYER } from "../../lib/engine/scene";
import { CAHMenuTitle } from "../objects/ui/menutitle";
import { CAHMenuBaseScene } from "./menubase";

export class CAHMainMenuScene extends CAHMenuBaseScene {
    title: CAHMenuTitle;

    constructor() {
        super();

        this.title = new CAHMenuTitle();
        this.add(this.title, UI_LAYER);
    }
}
