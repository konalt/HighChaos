import { globalTimer, w } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { Sidebar } from "../objects/menu/sidebar";
import { Sky, SKY_HEIGHT } from "../objects/sky";
import { Title } from "../objects/ui/title";

export class MenuScene extends Scene {
    title: Title;
    sidebar: Sidebar;
    sky: Sky;

    constructor() {
        super();

        this.sky = new Sky();
        this.add(this.sky);

        this.sidebar = new Sidebar();
        this.sidebar.width = 820;
        this.add(this.sidebar, UI_LAYER);

        this.title = new Title();
        this.title.x = w / 2;
        this.title.y = 180;
        this.title.scale = 1.2;
        this.title.src = "creative/txt/title.png";
        this.add(this.title, UI_LAYER);
    }

    update(): void {
        this.camera.y = -(Math.cos(globalTimer * 0.00002 + Math.PI) / 2 + 0.5) * SKY_HEIGHT;
    }
}
