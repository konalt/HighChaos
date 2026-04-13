import { ctx, CursorMode, d, getKeyDown, getMouse, h, loadImage, setCursorMode, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { anchorToCoords, basicPointInRect, FourNums } from "../../../lib/engine/utils";
import { getBlockData, getBlockName } from "../../game/blocks";
import { hotbar, HOTBAR_SELECT_KEYS, hotbarSlot, layer, selectHotbarSlot, setLayer, UI_COLOR } from "../../game/game";
import { InGameScene } from "../../scenes/ingame";
import { drawBlockRaw } from "../world";

const HOTBAR_ITEM_SIZE = 70;
const HOTBAR_PADDING_X = 15;
const HOTBAR_PADDING_Y = 15;
const HOTBAR_GAP = 5;
const HOTBAR_DESELECTED_SCALE = 0.9;
const HOTBAR_ROUND = 3;
const HOTBAR_SELECT_INDICATOR_SIZE = 1.5;

const HOTBAR_LAYER_SELECTOR_SIZE = 50;

export class Hotbar extends GameObject {
    private _width = 0;
    private _height = 0;
    private _path: Path2D | undefined;

    private _hoveredIndex = -1;

    private _lsHover = false;
    private _ls: HTMLImageElement[];

    needsUpdate = true;
    ignore = false;

    constructor() {
        super();

        this._ls = [];
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

            this._path = this._createPath();
        }

        if (!this.ignore) {
            if (getKeyDown("mwheelup")) {
                selectHotbarSlot(hotbarSlot - 1);
            }
            if (getKeyDown("mwheeldown")) {
                selectHotbarSlot(hotbarSlot + 1);
            }

            for (const [ind, key] of HOTBAR_SELECT_KEYS) {
                if (getKeyDown(key)) {
                    selectHotbarSlot(ind);
                }
            }

            this._checkLayerSelectorClick();

            this._hoveredIndex = -1;
            for (let i = 0; i < hotbar.length; i++) {
                this._checkItemClick(i);
            }
        }
    }

    draw() {
        if (this._path) {
            ctx.fillStyle = UI_COLOR;
            ctx.fill(this._path);
        }

        ctx.globalAlpha = this._lsHover ? 0.9 : 0.6;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this._ls[layer],
            (w - this._width) / 2 - HOTBAR_PADDING_X - HOTBAR_LAYER_SELECTOR_SIZE,
            h - HOTBAR_PADDING_Y - HOTBAR_LAYER_SELECTOR_SIZE,
            HOTBAR_LAYER_SELECTOR_SIZE,
            HOTBAR_LAYER_SELECTOR_SIZE,
        );
        ctx.globalAlpha = 1;

        for (let i = 0; i < hotbar.length; i++) {
            this._drawItem(i);
        }
    }

    private _checkLayerSelectorClick() {
        const rect = [
            (w - this._width) / 2 - HOTBAR_PADDING_X - HOTBAR_LAYER_SELECTOR_SIZE,
            h - HOTBAR_PADDING_Y - HOTBAR_LAYER_SELECTOR_SIZE,
            HOTBAR_LAYER_SELECTOR_SIZE,
            HOTBAR_LAYER_SELECTOR_SIZE,
        ] as FourNums;

        this._lsHover = basicPointInRect(...getMouse(true), ...rect);

        if (this._lsHover) {
            setCursorMode(CursorMode.Click);
            if (this.scene instanceof InGameScene) {
                this.scene.tooltip.show = true;
                this.scene.tooltip.text = layer == 0 ? "Switch to main layer" : "Switch to background layer";
            }
            if (getKeyDown("mouse1")) {
                setLayer(layer == 0 ? 1 : 0);
            }
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
            if (this.scene instanceof InGameScene && hotbar[index][0] > -1) {
                this.scene.tooltip.show = true;
                this.scene.tooltip.text = getBlockName(...hotbar[index]);
            }
            this._hoveredIndex = index;
            if (getKeyDown("mouse1")) {
                selectHotbarSlot(index);
            }
        }
    }

    private _drawItem(index: number) {
        let block = hotbar[index];

        let selected = index == hotbarSlot;
        let hovered = index == this._hoveredIndex;

        let rect = this._getItemCoords(index);

        if (!selected) {
            ctx.globalAlpha = hovered ? 0.7 : 0.5;
            drawBlockRaw(...rect, ...block);
            ctx.globalAlpha = 1;
        } else {
            drawBlockRaw(...rect, ...block);
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

    private _createPath() {
        let path = new Path2D();

        // layer selector box
        path.moveTo((w - this._width) / 2, h + HOTBAR_ROUND);
        path.lineTo((w - this._width) / 2 - HOTBAR_LAYER_SELECTOR_SIZE - HOTBAR_PADDING_X * 2, h + HOTBAR_ROUND);
        path.arc(
            (w - this._width) / 2 - HOTBAR_LAYER_SELECTOR_SIZE - HOTBAR_PADDING_X * 2 + HOTBAR_ROUND,
            h - HOTBAR_PADDING_Y * 2 - HOTBAR_LAYER_SELECTOR_SIZE + HOTBAR_ROUND,
            HOTBAR_ROUND,
            Math.PI,
            Math.PI * 1.5,
        );
        path.lineTo((w - this._width) / 2, h - HOTBAR_PADDING_Y * 2 - HOTBAR_LAYER_SELECTOR_SIZE);

        // Block selector
        path.arc(
            (w - this._width) / 2 + HOTBAR_ROUND,
            h - this._height + HOTBAR_ROUND,
            HOTBAR_ROUND,
            Math.PI,
            Math.PI * 1.5,
        );
        path.lineTo((w + this._width) / 2 - HOTBAR_ROUND, h - this._height);
        path.arc(
            (w + this._width) / 2 - HOTBAR_ROUND,
            h - this._height + HOTBAR_ROUND,
            HOTBAR_ROUND,
            Math.PI * 1.5,
            Math.PI * 2,
        );
        path.lineTo((w + this._width) / 2, h);

        path.closePath();

        return path;
    }

    async load(): Promise<void> {
        console.log("loading!");

        this._ls = await Promise.all(new Array(3).fill(0).map((_, i) => loadImage(`creative/icons/layer${i}.png`)));
    }
}
