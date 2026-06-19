import { Scene } from "../../lib/engine/scene";
import { GradientType } from "../../lib/engine/utils";
import { GradientBackground } from "../../lib/ui/background/gradientbackground";
import { Board } from "../objects/board";
import { BTTGameState, createGrid } from "../types";

export class MainScene extends Scene {
    board: Board;
    state: BTTGameState;

    constructor() {
        super();

        this.state = {
            fullGrids: [],
            nextGrid: null,
            nextTurn: "x",
            grid: createGrid(),
        };

        let background = new GradientBackground();
        background.type = GradientType.Linear;
        background.colors = ["#ba03e7", "#06005f"];
        this.add(background, -1);

        this.board = new Board(this.state);
        this.add(this.board);

        this.camera.x = 0;
        this.camera.y = 0;
    }

    update(): void {
        super.update();
    }
}
