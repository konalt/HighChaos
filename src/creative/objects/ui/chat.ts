import {
    ctx,
    d,
    getKey,
    getKeyDown,
    getTyping,
    getTypingCursor,
    getTypingCursorFlashTime,
    getTypingText,
    onTypingFinish,
    setTypingCursor,
    setTypingText,
    since,
    startTyping,
    w,
} from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { messages } from "../../game/chat";
import { socket } from "../../game/game";
import { PACKET } from "../../net/packets";

const margin = 15;
const padding = 10;
const fontsize = 20;

const bw = 350;
const bh = 365;

const bg = "rgba(0,0,0,0.75)";

export class Chat extends GameObject {
    messages: [string, string][] = messages;

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
        this.visible = !getKey("tab");

        if (getKeyDown("keyt") || getKeyDown("slash")) {
            startTyping("chat");
            if (getKeyDown("slash")) {
                setTypingText("chat", "/");
                setTypingCursor("chat", 1);
            }
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
            0,
            bh - padding * 2,
        );

        let text = getTypingText("chat") ?? "";
        let overflow = false;
        while (ctx.measureText(text).width > bw - padding * 2) {
            text = text.slice(1);
            overflow = true;
        }
        if (overflow) {
            d.text(w - margin - padding, margin + bh + padding + 2.5, text, "white", ctx.font, "right");
        } else {
            d.text(w - margin - bw + padding, margin + bh + padding + 2.5, text, "white", ctx.font, "left");
        }

        if (getTyping("chat") && since(getTypingCursorFlashTime()) % 1000 < 500) {
            let cx = w - margin - padding;
            if (!overflow) {
                cx = w - margin - bw + padding + ctx.measureText(text.substring(0, getTypingCursor("chat"))).width;
            }
            ctx.beginPath();
            ctx.moveTo(cx, margin + bh + padding + 2.5);
            ctx.lineTo(cx, margin + bh + padding + fontsize);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";
            ctx.stroke();
        }
    }
}
