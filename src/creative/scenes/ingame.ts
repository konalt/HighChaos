import { addDebugLine, h, loadImage, overrideDeltaTime, setTargetFramerate, since, w } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { lerp } from "../../lib/engine/utils";
import { Background } from "../../lib/ui/background/background";
import { HCRect } from "../../lib/ui/hcrect";
import { socket } from "../game/game";
import { handleInput } from "../game/input";
import { players, ply, updatePlayers } from "../game/player";
import { gameSettings } from "../game/settings";
import { ClientPlayerState } from "../net/interp";
import { BlockObject } from "../objects/block";
import { PlayerObject } from "../objects/player";
import { Sky } from "../objects/sky";
import { Chat } from "../objects/ui/chat";
import { PlayerBoard } from "../objects/ui/playerboard";
import { World } from "../objects/world";

export let testPlayerImage: HTMLImageElement;

let maxCameraY = 0;

export class InGameScene extends Scene {
    players: Map<string, PlayerObject>;
    chat: Chat;

    localPlayer: PlayerObject | undefined;

    constructor() {
        super();

        this.players = new Map();

        let sky = new Sky();
        this.add(sky);

        let world = new World();
        this.add(world);

        let pb = new PlayerBoard();
        this.add(pb, UI_LAYER);

        this.chat = new Chat();
        this.add(this.chat, UI_LAYER);

        this._loadPlayers();

        maxCameraY = 5 * gameSettings.blockSize - h / 2;
    }

    private _createPlayerObject(ply: ClientPlayerState) {
        let plyo = new PlayerObject(ply);
        plyo.x = ply.x;
        plyo.y = ply.y;
        plyo.name = ply.id;
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
        if (!plyo) return;
        this.remove(plyo);
    }

    update(): void {
        super.update();

        handleInput();

        for (const [id, ply] of players) {
            if (!this.players.has(id)) {
                this._createPlayerObject(ply);
            }
        }

        updatePlayers();

        if (!ply) return;

        this.camera.x = ply.x;
        this.camera.y = Math.min(ply.y, maxCameraY);

        addDebugLine(`Name: ${ply.id}`);
        addDebugLine(`ID: ${ply.id}`);
    }

    async init() {
        testPlayerImage = await loadImage("creative/testplayer.png");
    }
}
