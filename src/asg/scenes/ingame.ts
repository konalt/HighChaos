import { CursorMode, setCursorMode } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { Background } from "../../lib/ui/background/background";
import { HCRect } from "../../lib/ui/hcrect";
import { ASGLayer } from "../layers";
import { ASGScrollingBackground } from "../objects/bg/scrolling_bg";
import { ASGBullet } from "../objects/bullet";
import { ASGEnemy } from "../objects/enemy";
import { ASGHitbox } from "../objects/hitbox";
import { ASGPlayer } from "../objects/player";

export class ASGInGameScene extends Scene {
    player: ASGPlayer;
    hitbox: ASGHitbox;

    bullets: ASGBullet[];

    constructor() {
        super();

        let bg = new ASGScrollingBackground("asg/bg/pa_scary.png");
        this.add(bg, ASGLayer.BG);

        this.player = new ASGPlayer();
        this.add(this.player, ASGLayer.PLAYER);

        this.hitbox = new ASGHitbox();
        this.add(this.hitbox, ASGLayer.HITBOX);

        this.bullets = [];

        const r = new HCRect();
        r.x = -10;
        r.y = -10;
        r.w = 500;
        r.h = 10;
        this.add(r);

        const e = new ASGEnemy();
        e.x = 200;
        e.y = 200;
        this.add(e, ASGLayer.ENEMY);
    }

    // camera following
    private _updateCamera() {
        this.camera.x = this.player.x;
        this.camera.y = this.player.y;
    }

    addBullet(b: ASGBullet) {
        this.add(b, ASGLayer.BULLET);
        this.bullets.push(b);
    }

    update(): void {
        super.update();

        // disable mouse cursor
        setCursorMode(CursorMode.None);

        // * removed - i dont like it anymore
        //this._updateCamera();
    }
}
