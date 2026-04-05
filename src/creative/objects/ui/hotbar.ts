import { ctx, d, getKeyDown, h, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { anchorToCoords, FourNums } from "../../../lib/engine/utils";
import { hotbar, hotbarSlot, selectHotbarSlot, UI_COLOR } from "../../game/game";
import { InGameScene } from "../../scenes/ingame";
import { drawBlockRaw } from "../world";

const HOTBAR_ITEM_SIZE = 75;
const HOTBAR_PADDING_X = 15;
const HOTBAR_PADDING_Y = 15;
const HOTBAR_GAP = 10;
const HOTBAR_DESELECTED_SCALE = 0.85;
const HOTBAR_ROUND = 10;

const HOTBAR_SELECT_KEYS: [number, string][] = new Array(9).fill(0).map((_, i) => [i, `Digit${i + 1}`]);

export class Hotbar extends GameObject {
    private _width = 0;
    private _height = 0;

    needsUpdate = true;

    constructor() {
        super();
    }

    update(): void {
        if (this.needsUpdate) {
            this._width = HOTBAR_ITEM_SIZE * hotbar.length + HOTBAR_GAP * (hotbar.length - 1) + HOTBAR_PADDING_X * 2;
            this._height = HOTBAR_ITEM_SIZE + HOTBAR_PADDING_Y * 2;
            if (this.scene instanceof InGameScene) {
                const [bx, by] = anchorToCoords("bc", w / 2, h, this._width, this._height);
                const rect: FourNums = [bx, by, this._width, this._height];
                this.scene.world.noclickAreas.set("hotbar", rect);
            }
        }

        for (const [ind, key] of HOTBAR_SELECT_KEYS) {
            if (getKeyDown(key)) {
                selectHotbarSlot(ind);
            }
        }
    }

    draw() {
        d.roundRect(
            w / 2,
            h + HOTBAR_ROUND,
            this._width,
            this._height + HOTBAR_ROUND,
            HOTBAR_ROUND,
            UI_COLOR,
            "",
            0,
            "bc",
        );

        for (let i = 0; i < hotbar.length; i++) {
            this._drawItem(i);
        }
    }

    private _drawItem(index: number) {
        let type = hotbar[index];

        /* if (type == -1) {
            // empty slot
            return;
        } */

        let selected = index == hotbarSlot;

        let x = (w - this._width) / 2 + HOTBAR_PADDING_X + (HOTBAR_ITEM_SIZE + HOTBAR_GAP) * index;
        let y = h - this._height + HOTBAR_PADDING_Y;

        if (!selected) {
            ctx.globalAlpha = 0.5;

            drawBlockRaw(
                x + (HOTBAR_ITEM_SIZE * (1 - HOTBAR_DESELECTED_SCALE)) / 2,
                y + (HOTBAR_ITEM_SIZE * (1 - HOTBAR_DESELECTED_SCALE)) / 2,
                HOTBAR_ITEM_SIZE * HOTBAR_DESELECTED_SCALE,
                HOTBAR_ITEM_SIZE * HOTBAR_DESELECTED_SCALE,
                type,
            );
            ctx.globalAlpha = 1;
        } else {
            drawBlockRaw(x, y, HOTBAR_ITEM_SIZE, HOTBAR_ITEM_SIZE, type);
            d.rect(x - 2, y - 2, HOTBAR_ITEM_SIZE + 4, HOTBAR_ITEM_SIZE + 4, "transparent", "white", 3);
        }
    }
}
