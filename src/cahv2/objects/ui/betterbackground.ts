import { ctx, d, getMouse, globalTimer, h, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { sample } from "../../../lib/engine/utils";
import { blackCardReplace, whiteCardReplace } from "../../utils";
import { CAHCard, CardBackWhite } from "./card";

export class CAHBetterBackground extends GameObject {
    private _rows: ImageBitmap[];
    private _cardWidth = 1;
    private _cardHeight = 1;
    private _cardCount = 1;
    private _cardScale = 1;

    private _grad: CanvasGradient;

    rowCount = 6;
    scrollSpeed = 0.1;

    constructor() {
        super();

        this._rows = [];
        this._grad = this._createGradient();
    }

    private _createRow() {
        // create a card image
        const img = CAHCard.renderCard("Test hahaha", false);

        // the scale factor
        this._cardScale = h / img.height / this.rowCount;

        this._cardWidth = img.width * this._cardScale;
        this._cardHeight = img.height * this._cardScale;

        // how many we need
        this._cardCount = Math.ceil((w * 2) / this._cardWidth) + 1;

        // set up canvas
        const canvas = new OffscreenCanvas(this._cardCount * this._cardWidth, this._cardHeight);
        const ctx = canvas.getContext("2d");

        // fuck sake
        if (!ctx) throw new Error("fuck off");

        ctx.save();
        for (let i = 0; i < this._cardCount; i++) {
            const isWhite = Math.random() < 0.5;
            let text = sample(isWhite ? window.cardsWhite : window.cardsBlack);
            if (isWhite) {
                text = whiteCardReplace(text);
            } else {
                text = blackCardReplace(text);
            }
            const img = CAHCard.renderCard(text, isWhite);
            ctx.drawImage(img, 0, 0, this._cardWidth, this._cardHeight);
            ctx.translate(this._cardWidth, 0);
        }
        ctx.restore();

        const final = canvas.transferToImageBitmap();

        return final;
    }

    draw() {
        ctx.save();

        const offset = (globalTimer * this.scrollSpeed) % this._rows[0].width;

        let i = 0;
        for (const row of this._rows) {
            let mult = 1;
            if (i % 2 == 0) mult = -1;
            ctx.drawImage(row, (0 - offset) * mult, 0);
            ctx.drawImage(row, (row.width - offset) * mult, 0);
            ctx.translate(0, row.height);
            i++;
        }

        ctx.restore();

        ctx.save();
        ctx.translate(...getMouse(true));
        d.rect(-w, -h, w * 2, h * 2, this._grad);
        ctx.restore();
    }

    init() {
        for (let i = 0; i < this.rowCount; i++) {
            this._rows.push(this._createRow());
        }
    }

    private _createGradient() {
        const g = ctx.createRadialGradient(0, 0, w * 0.02, 0, 0, w * 0.3);

        // color stops
        g.addColorStop(0, "rgba(0, 0, 0, 0.55)");
        g.addColorStop(1, "rgba(0, 0, 0, 0.88)");

        return g;
    }
}
