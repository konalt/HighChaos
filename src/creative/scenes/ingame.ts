import { Scene } from "../../lib/engine/scene";
import { Background } from "../../lib/ui/background/background";
import { HCRect } from "../../lib/ui/hcrect";
import { localPlayerUpdate, players, ply, socket } from "../game";
import { PlayerObject } from "../objects/player";

export class InGameScene extends Scene {
    background: Background;
    players: Map<string, PlayerObject>;

    localPlayer: PlayerObject;

    constructor() {
        super();

        this.players = new Map();

        this.background = new Background();
        this.background.color = "#184fe6";
        this.add(this.background, -1);

        let rect = new HCRect();
        rect.color = "#694f05";
        this.add(rect);

        this._loadPlayers();
    }

    private _loadPlayers() {
        for (const [k, ply] of players) {
            let plyo = new PlayerObject();
            plyo.x = ply.x;
            plyo.y = ply.y;
            plyo.name = ply.name;
            this.add(plyo);

            this.players.set(k, plyo);
            if (k == socket.id) {
                this.localPlayer = plyo;
            }
        }
    }

    update(): void {
        super.update();

        if (!this.localPlayer) return;

        localPlayerUpdate();

        this.localPlayer.x = ply.x;
        this.localPlayer.y = ply.y;

        this.camera.x = this.localPlayer.x;
        this.camera.y = this.localPlayer.y;
    }
}
