import { addDebugLine, getKeyDown, h, loadImage } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { loadHotbar, socket } from "../game/game";
import { handleInput } from "../game/input";
import { players, ply, updatePlayers } from "../game/player";
import { gameSettings } from "../game/settings";
import { ClientPlayerState } from "../net/interp";
import { PlayerObject } from "../objects/player";
import { Sky } from "../objects/sky";
import { Chat } from "../objects/ui/chat";
import { Hotbar } from "../objects/ui/hotbar";
import { Inventory } from "../objects/ui/inventory";
import { PlayerBoard } from "../objects/ui/playerboard";
import { World } from "../objects/world";

export let testPlayerImage: HTMLImageElement;

export class InGameScene extends Scene {
    players: Map<string, PlayerObject>;
    chat: Chat;
    hotbar: Hotbar;
    inventory: Inventory;

    world: World;

    localPlayer: PlayerObject | undefined;

    constructor() {
        super();

        this.players = new Map();

        let sky = new Sky();
        this.add(sky);

        this.world = new World();
        this.add(this.world);

        let pb = new PlayerBoard();
        this.add(pb, UI_LAYER);

        this.chat = new Chat();
        this.add(this.chat, UI_LAYER);

        this.hotbar = new Hotbar();
        this.add(this.hotbar, UI_LAYER);

        this.inventory = new Inventory();
        this.add(this.inventory, UI_LAYER + 2);

        this.camera.zoom = 0.85;

        this._loadPlayers();
    }

    private _createPlayerObject(ply: ClientPlayerState) {
        let plyo = new PlayerObject(ply);
        plyo.x = ply.x;
        plyo.y = ply.y;
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

        if (getKeyDown("f1")) {
            this.chat.enabled = !this.chat.enabled;
            this.hotbar.visible = !this.hotbar.visible;
        }

        if (getKeyDown("keye") || (this.inventory._show && getKeyDown("escape"))) {
            this.world.disableControl = !this.inventory._show;
            this.hotbar.ignore = !this.inventory._show;
            this.inventory.toggle();
        }

        handleInput(this.inventory._show);

        if (!this.inventory._show) {
            if (getKeyDown("minus")) {
                this.camera.zoom /= 1.05;
            }
            if (getKeyDown("equal")) {
                this.camera.zoom *= 1.05;
                if (this.camera.zoom > 1) this.camera.zoom = 1;
            }
        }

        for (const [id, ply] of players) {
            if (!this.players.has(id)) {
                this._createPlayerObject(ply);
            }
        }

        updatePlayers();

        if (!ply) return;

        this.camera.x = ply.x;
        this.camera.y = ply.y - gameSettings.playerHeight / 2; //Math.min(ply.y, maxCameraY);

        addDebugLine(`Name: ${ply.id}`);
        addDebugLine(`ID: ${ply.id}`);
    }

    async init() {
        await super.init();

        loadHotbar();

        testPlayerImage = await loadImage("creative/testplayer.png");
    }
}
