import { w } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { Background } from "../../lib/ui/background/background";
import { Sidebar } from "../objects/menu/sidebar";
import { Title } from "../objects/ui/title";

export class MenuScene extends Scene {
    title: Title;
    sidebar: Sidebar;
    background: Background;

    constructor() {
        super();

        this.background = new Background();
        this.background.color = "#2bdfff";
        this.add(this.background, -1);

        this.title = new Title();
        this.title.x = w / 2;
        this.title.y = 200;
        this.title.scale = 1;
        this.title.src = "creative/txt/title.png";
        this.add(this.title, UI_LAYER);

        this.sidebar = new Sidebar();
        this.add(this.sidebar, UI_LAYER);
    }
}
