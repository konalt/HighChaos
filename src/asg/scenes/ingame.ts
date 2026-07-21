import { CursorMode, setCursorMode } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { Background } from "../../lib/ui/background/background";
import { HCRect } from "../../lib/ui/hcrect";
import { ASGEnemy } from "../objects/enemy";
import { ASGPlayer } from "../objects/player";

export class ASGInGameScene extends Scene {
    player: ASGPlayer;

    constructor() {
        super();

        let bg = new Background();
        bg.color = "#001";
        this.add(bg, -1);

        this.player = new ASGPlayer();
        this.add(this.player, 5);

        const r = new HCRect();
        r.x = -10;
        r.y = -10;
        r.w = 500;
        r.h = 10;
        this.add(r);

        const e = new ASGEnemy();
        e.x = 200;
        e.y = 200;
        this.add(e);
    }

    // camera following
    private _updateCamera() {
        this.camera.x = this.player.x;
        this.camera.y = this.player.y;
    }

    update(): void {
        super.update();

        // disable mouse cursor
        setCursorMode(CursorMode.None);

        this._updateCamera();
    }
}
