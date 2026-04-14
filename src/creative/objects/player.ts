import { ctx, d, debugMode, font } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { lerp } from "../../lib/engine/utils";
import { extraPlayerInfo } from "../game/extraplayerinfo";
import { pingTable } from "../game/ping";
import { gameSettings } from "../game/settings";
import { ClientPlayerState } from "../net/interp";
import { testPlayerImage } from "../scenes/ingame";

export class PlayerObject extends GameObject {
    name: string = "unnamed";
    ply: ClientPlayerState;

    constructor(ply: ClientPlayerState) {
        super();
        this.ply = ply;
    }

    update() {
        this.name = extraPlayerInfo.names.get(this.ply.id) ?? "Unknown";
    }

    draw() {
        let drawX = this.ply.x;
        let drawY = this.ply.y;
        ctx.save();
        ctx.translate(drawX, drawY);

        if (!this.ply.ready) ctx.globalAlpha = 0.5;
        d.quickImage(testPlayerImage, 0, 0, gameSettings.playerHeight / testPlayerImage.height, "bc");
        if (!this.ply.ready) ctx.globalAlpha = 1;

        ctx.font = font(20, "600");
        ctx.textBaseline = "alphabetic";

        const nameMeasure = ctx.measureText(this.name);
        const nameWidth = nameMeasure.width;
        const nameHeight = nameMeasure.fontBoundingBoxAscent + nameMeasure.fontBoundingBoxDescent;
        const nameBoxMarginX = 8;
        const nameBoxMarginY = 6;
        d.roundRect(
            0,
            -gameSettings.playerHeight - nameBoxMarginY * 2,
            nameWidth + nameBoxMarginX * 2,
            nameHeight + nameBoxMarginY * 2,
            5,
            "rgba(0,0,0,0.5)",
            "",
            0,
            "bc",
        );

        d.text(0, -gameSettings.playerHeight - nameBoxMarginY * 3.5, this.name ?? ":3", "#fff", ctx.font, "center");

        if (debugMode) {
            d.text(
                0,
                -gameSettings.playerHeight - nameBoxMarginY * 10 - 80,
                "Ping: " +
                    Math.round(pingTable[this.ply.id]).toString() +
                    "ms\n" +
                    `x: ${this.ply.x}, y: ${this.ply.y}, dx: ${this.ply.dx}, dy: ${this.ply.dy}`,
                "red",
                ctx.font,
                "center",
            );
        }

        ctx.restore();
    }

    async load() {
        await super.load();
    }
}
