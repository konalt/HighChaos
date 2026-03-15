import { h } from "../../lib/engine/engine";
import { Scene } from "../../lib/engine/scene";
import { GradientType } from "../../lib/engine/utils";
import { GradientBackground } from "../../lib/ui/background/gradientbackground";
import { PlayerObject } from "../objects/player";

export class InGameScene extends Scene {
    background: GradientBackground;
    players: Map<string, PlayerObject>;

    testPlayer: PlayerObject;

    constructor() {
        super();

        this.players = new Map();

        this.background = new GradientBackground();
        this.background.type = GradientType.Radial;
        this.background.colors = ["#3098fa", "#184fe6"];
        this.background.scale = 1.5;
        this.background.y = h / 2;
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
