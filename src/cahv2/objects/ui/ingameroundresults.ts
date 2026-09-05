import { ctx, font } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { createOffscreenCanvas } from "../../../lib/engine/utils";
import { NULLTEXTURE } from "../../../lib/ui/hcimage";
import { currentGame } from "../../game";
import { CAHRoundResults } from "../../types";

const Width = 650;
const Padding = 20;
const PlayerHeight = 80;
const PlayerGap = 10;
const Round = 15;

export class CAHInGameRoundResults extends GameObject {
    private _width: number;
    private _height: number;

    constructor() {
        super();

        this._width = Width;
        this._height = 0;

        this._cached = this._createResultsScreen([]);
    }

    private _calculateHeight(playerCount: number) {
        return Padding * 2 + PlayerHeight * playerCount + PlayerGap * (playerCount - 1);
    }

    draw() {
        ctx.drawImage(this._cached, this.x - this._width / 2, this.y - this._height / 2, this._width, this._height);
    }

    setResults(results: CAHRoundResults) {
        this._cached = this._createResultsScreen(results);
    }

    //#region rendering
    private _cached: ImageBitmap;

    private _createResultsScreen(results: CAHRoundResults) {
        const playerCount = results.length;
        this._height = this._calculateHeight(playerCount);

        const [w, h] = [Width, this._height];
        const [c, ctx] = createOffscreenCanvas(w, h);

        // draw background
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, Round);
        ctx.fill();

        ctx.save();
        ctx.translate(0, Padding + PlayerHeight / 2);
        for (const [id, scoreDiff] of results) {
            const ply = currentGame.players.get(id);
            if (!ply) continue;

            let x = Padding;

            // draw avatar
            ctx.drawImage(NULLTEXTURE, x, -PlayerHeight / 2, PlayerHeight, PlayerHeight);
            x += PlayerHeight + 10; // avatar + gap

            // draw name
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = font(PlayerHeight * 0.5, "bold");
            ctx.fillText(ply.name, x, 0);

            // draw score
            ctx.fillStyle = "#2ccc0b";
            ctx.textAlign = "right";
            ctx.font = font(PlayerHeight * 0.5);
            ctx.fillText(`+${scoreDiff}`, w - Padding, 0);

            // transform for next
            ctx.translate(0, PlayerHeight + PlayerGap);
        }
        ctx.restore();

        return c.transferToImageBitmap();
    }
    //#endregion
}
