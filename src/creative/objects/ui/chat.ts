import {
    ctx,
    d,
    font,
    getKeyDown,
    getTyping,
    getTypingCursor,
    getTypingCursorFlashTime,
    getTypingText,
    onTypingFinish,
    setFont,
    setTypingText,
    since,
    startTyping,
    w,
} from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { socket } from "../../game";
import { PACKET } from "../../net/packets";

const margin = 15;
const padding = 10;
const fontsize = 24;

const bw = 350;
const bh = 350;

const bg = "rgba(0,0,0,0.75)";

export class Chat extends GameObject {
    messages: [string, string][] = [
        ["test", "bluh bluh bluh bluh ! ! ! ! ! ! ! ! !"],
        ["a", "bcdefg"],
    ];

    constructor() {
        super();

        onTypingFinish("chat", (text) => {
            if (text.trim().length > 0) {
                socket.emit(PACKET.CS_CHAT_SEND, text);
            }
            setTypingText("chat", "");
        });
    }

    private _getChatText() {
        return this.messages.map((m) => m.join(": ")).join("\n");
    }

    update(): void {
        if (getKeyDown("keyt")) {
            startTyping("chat");
        }
    }

    draw() {
        ctx.font = `${fontsize}px sans-serif`;
        ctx.textBaseline = "top";

        d.roundRect(w - margin, margin, bw, bh, 5, bg, "", 0, "tr");
        d.roundRect(w - margin, margin + bh + padding, bw, fontsize + 5, 5, bg, "", 0, "tr");

        let chatText = this._getChatText();
        d.text(
            w - margin - bw + padding,
            margin + padding + 2.5,
            chatText,
            "white",
            ctx.font,
            "left",
            bw - padding * 2,
        );

        let text = getTypingText("chat") ?? "";
        while (ctx.measureText(text).width > bw - padding * 2) {
            text = text.slice(1);
        }
        d.text(w - margin - bw + padding, margin + bh + padding + 2.5, text, "white", ctx.font, "left");

        if (getTyping() && since(getTypingCursorFlashTime()) % 1000 < 500) {
            let cx = ctx.measureText(text.substring(0, getTypingCursor("chat"))).width;
            ctx.beginPath();
            ctx.moveTo(w - margin - bw + padding + cx, margin + bh + padding + 2.5);
            ctx.lineTo(w - margin - bw + padding + cx, margin + bh + padding + fontsize);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";
            ctx.stroke();
        }
    }
}
