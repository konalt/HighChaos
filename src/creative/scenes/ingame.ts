import { loadImage, since } from "../../lib/engine/engine";
import { Scene } from "../../lib/engine/scene";
import { lerp } from "../../lib/engine/utils";
import { Background } from "../../lib/ui/background/background";
import { HCRect } from "../../lib/ui/hcrect";
import { gameSettings, localPlayerUpdate, Player, players, ply, socket } from "../game";
import { lastPlayerUpdate } from "../handlers";
import { PlayerObject } from "../objects/player";

export let testPlayerImage: HTMLImageElement;

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

    private _createPlayerObject(ply: Player) {
        let plyo = new PlayerObject();
        plyo.x = ply.x;
        plyo.y = ply.y;
        plyo.name = ply.name;
        plyo.ply = ply;
        this.add(plyo);

        this.players.set(ply.id, plyo);
        if (ply.id == socket.id) {
            this.localPlayer = plyo;
        }

        return plyo;
    }

    private _loadPlayers() {
        for (const [_, ply] of players) {
            this._createPlayerObject(ply);
        }
    }

    removePlayer(id: string) {
        let plyo = this.players.get(id);
        this.remove(plyo);
    }

    update(): void {
        super.update();

        if (!this.localPlayer) return;

        localPlayerUpdate();

        for (const [k, ply] of players) {
            let plyo = this.players.get(k);
            if (!plyo) plyo = this._createPlayerObject(ply);
            plyo.x = ply.x;
            plyo.y = ply.y;
        }

        let t = Math.min(since(lastPlayerUpdate[ply.id]) / gameSettings.updateRate, 1);

        let drawX = lerp(t, ply.old_x, ply.x);
        let drawY = lerp(t, ply.old_y, ply.y);

        this.camera.x = drawX;
        this.camera.y = drawY;
    }

    async init() {
        testPlayerImage = await loadImage("creative/testplayer.png");
    }
}
