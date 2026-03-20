import { ctx, d, font, w, h, getFPS, getKey } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { socket } from "../../game/game";
import { pingTable } from "../../game/ping";

const marginTop = 60;
const padding = 20;

const bw = 1400;
const bh = h - marginTop * 2;

const entryHeight = 82;
const entryGap = 5;
const entryPadding = 8;
const avatarSize = entryHeight - entryPadding * 2;

export class PlayerBoard extends GameObject {
    constructor() {
        super();
    }

    update() {
        this.visible = getKey("tab");
    }

    draw() {
        ctx.textBaseline = "top";

        d.roundRect(w / 2, marginTop, bw, bh, 5, "rgba(0,0,0,0.5)", "", 0, "tc");

        let left = w / 2 - bw / 2 + padding;
        let center = w / 2;
        let right = w / 2 + bw / 2 - padding;
        let y = marginTop + padding;

        d.text(left, y, `FPS: ${getFPS()}`, "white", font(28), "left");
        d.text(right, y, `Ping: ${Math.round(pingTable[socket.id])}ms`, "white", font(28), "right");

        d.text(center, y, "Konalt Creative", "white", font(48), "center");
        y += 48;
        /* let onlineText: string;
        if (players.size == 1) {
            onlineText = `1 user online :(`;
        } else {
            onlineText = `${players.size} users online`;
        }
        d.text(center, y, onlineText, "white", font(32), "center");
        y += 32;

        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();

        y += 8;

        for (const [_, ply] of players) {
            d.roundRect(left, y, bw - padding * 2, entryHeight, 5, "rgba(0,0,0,0.5)");

            d.roundRect(left + entryPadding, y + entryPadding, avatarSize, avatarSize, 5, "#0f0");

            ctx.textBaseline = "middle";
            d.text(
                left + avatarSize + entryPadding + entryPadding,
                y + entryHeight / 2 + 4,
                ply.name,
                "white",
                font(28),
                "left",
            );
            y += entryHeight + entryGap;
        } */
    }
}
