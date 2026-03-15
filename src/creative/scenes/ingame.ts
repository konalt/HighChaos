import { Scene } from "../../lib/engine/scene";
import { Background } from "../../lib/ui/background/background";
import { PlayerObject } from "../objects/player";

export class InGameScene extends Scene {
    background: Background;
    players: Map<string, PlayerObject>;

    testPlayer: PlayerObject;

    constructor() {
        super();

        this.players = new Map();

        this.background = new Background();
        this.background.color = "#184fe6";
        this.add(this.background, -1);

        this.testPlayer = new PlayerObject();
        this.testPlayer.x = 300;
        this.testPlayer.y = 400;
        this.players.set("test", this.testPlayer);

        this.add(this.testPlayer);
    }

    update(): void {
        super.update();

        this.camera.x = this.testPlayer.x;
        this.camera.y = this.testPlayer.y;
    }
}
