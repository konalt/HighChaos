import { ctx, CursorMode, d, getKeyDown, getMouse, h, setCursorMode, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { anchorToCoords, basicPointInRect, FourNums } from "../../../lib/engine/utils";
import { hotbar, hotbarSlot, selectHotbarSlot, UI_COLOR } from "../../game/game";
import { InGameScene } from "../../scenes/ingame";
import { drawBlockRaw } from "../world";

const HOTBAR_ITEM_SIZE = 75;
const HOTBAR_PADDING_X = 15;
const HOTBAR_PADDING_Y = 15;
const HOTBAR_GAP = 10;
const HOTBAR_DESELECTED_SCALE = 0.85;
const HOTBAR_ROUND = 10;
const HOTBAR_SELECT_INDICATOR_SIZE = 2;

const HOTBAR_SELECT_KEYS: [number, string][] = new Array(9).fill(0).map((_, i) => [i, `Digit${i + 1}`]);

export class Hotbar extends GameObject {
    private _width = 0;
    private _height = 0;

    private _hoveredIndex = -1;

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

        this._hoveredIndex = -1;
        for (let i = 0; i < hotbar.length; i++) {
            this._checkItemClick(i);
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

    private _getItemCoords(index: number): FourNums {
        let selected = index == hotbarSlot;

        let x = (w - this._width) / 2 + HOTBAR_PADDING_X + (HOTBAR_ITEM_SIZE + HOTBAR_GAP) * index;
        let y = h - this._height + HOTBAR_PADDING_Y;

        if (selected) {
            let s = HOTBAR_ITEM_SIZE;
            return [x, y, s, s];
        } else {
            let s = HOTBAR_ITEM_SIZE * HOTBAR_DESELECTED_SCALE;
            let o = (HOTBAR_ITEM_SIZE * (1 - HOTBAR_DESELECTED_SCALE)) / 2;
            return [x + o, y + o, s, s];
        }
    }

    private _checkItemClick(index: number) {
        let rect = this._getItemCoords(index);
        let mouse = getMouse(true);

        if (basicPointInRect(...mouse, ...rect)) {
            setCursorMode(CursorMode.Click);
            this._hoveredIndex = index;
            if (getKeyDown("mouse1")) {
                selectHotbarSlot(index);
            }
        }
    }

    private _drawItem(index: number) {
        let type = hotbar[index];

        let selected = index == hotbarSlot;
        let hovered = index == this._hoveredIndex;

        let rect = this._getItemCoords(index);

        if (!selected) {
            ctx.globalAlpha = hovered ? 0.7 : 0.5;
            drawBlockRaw(...rect, type);
            ctx.globalAlpha = 1;
        } else {
            drawBlockRaw(...rect, type);
            d.rect(
                rect[0] - HOTBAR_SELECT_INDICATOR_SIZE,
                rect[1] - HOTBAR_SELECT_INDICATOR_SIZE,
                rect[2] + HOTBAR_SELECT_INDICATOR_SIZE * 2,
                rect[3] + HOTBAR_SELECT_INDICATOR_SIZE * 2,
                "transparent",
                "white",
                3,
            );
        }
    }
}
