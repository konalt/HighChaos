import { CursorMode, h, setCursorMode, w } from "../../lib/engine/engine";
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
        this.player.x = w / 2;
        this.player.y = h - 100;
        this.add(this.player, ASGLayer.PLAYER);

        this.hitbox = new ASGHitbox();
        this.add(this.hitbox, ASGLayer.HITBOX);

        this.bullets = [];

        const e = new ASGEnemy();
        e.x = w / 2;
        e.y = 100;
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
