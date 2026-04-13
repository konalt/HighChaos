import { ctx, d, deltaTime } from "../../../lib/engine/engine";
import { rand } from "../../../lib/engine/utils";
import { Block } from "../../game/blocks";
import { gameSettings } from "../../game/settings";
import { world } from "../../game/world";
import { getBlockSprite } from "../../sprites";
import { getBlockSpriteFromType, getGridPos } from "../world";
import { BaseEffect } from "./baseeffect";

export const BREAK_PIECE_COUNT = 5;
export const BREAK_PIECE_GRAVITY = 4000;
export const BREAK_PIECE_DX_MIN = 100;
export const BREAK_PIECE_DX_MAX = 300;
export const BREAK_PIECE_DY_MIN = 300;
export const BREAK_PIECE_DY_MAX = 500;
export const BREAK_PIECE_SIZE = 12;

interface BreakPiece {
    x: number;
    y: number;
    dx: number;
    dy: number;
    imgX: number;
    imgY: number;
}

export class BlockBreakEffect extends BaseEffect {
    private _sprite: HTMLImageElement;
    pieces: BreakPiece[] = [];

    constructor(blk: Block, subtype = 0, dark = false) {
        super();

        this._sprite = getBlockSpriteFromType(blk, subtype, dark)[0];
        this.duration = 400;
        for (let i = 0; i < BREAK_PIECE_COUNT; i++) {
            let r1 = Math.random() - 0.5;
            this.pieces.push({
                dx: rand(BREAK_PIECE_DX_MIN, BREAK_PIECE_DX_MAX) * Math.sign(r1),
                dy: -rand(BREAK_PIECE_DY_MIN, BREAK_PIECE_DY_MAX),
                x: Math.random() * gameSettings.blockSize,
                y: Math.random() * gameSettings.blockSize,
                imgX: Math.floor(Math.random() * (this._sprite.width / 4)),
                imgY: Math.floor(Math.random() * (this._sprite.height / 4)),
            });
        }
    }

    private _updatePiece(p: BreakPiece) {
        let o = structuredClone([p.x, p.y]);
        p.x += p.dx * deltaTime;
        if (world.getBlockAt(...getGridPos([this.x + p.x, this.y + p.y]), 1)) {
            p.x = o[0];
        }

        p.dy += BREAK_PIECE_GRAVITY * deltaTime;
        p.y += p.dy * deltaTime;
        if (world.getBlockAt(...getGridPos([this.x + p.x, this.y + p.y]), 1)) {
            p.y = o[1];
            p.dy = 0;
            p.dx *= 0.95;
        }
    }

    private _drawPiece(p: BreakPiece) {
        ctx.drawImage(
            this._sprite,
            p.imgX,
            p.imgY,
            this._sprite.width / 4,
            this._sprite.height / 4,
            this.x + p.x - gameSettings.blockSize / 8,
            this.y + p.y - gameSettings.blockSize / 8,
            gameSettings.blockSize / 4,
            gameSettings.blockSize / 4,
        );
    }

    update(): void {
        super.update();
        for (const piece of this.pieces) {
            this._updatePiece(piece);
        }
    }

    draw(): void {
        super.draw();
        ctx.globalAlpha = 1 - this.t();
        for (const piece of this.pieces) {
            this._drawPiece(piece);
        }
        ctx.globalAlpha = 1;
    }
}
