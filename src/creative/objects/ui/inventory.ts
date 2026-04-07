import { easeOutCirc } from "../../../lib/engine/ease";
import { ctx, d, getKey, getKeyDown, getMouse, h, since, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { basicPointInRect, clamp, FourNums, TwoNums } from "../../../lib/engine/utils";
import {
    EMPTY_INV_SLOT,
    firstEmptyHotbarSlot,
    hotbar,
    HOTBAR_SELECT_KEYS,
    HOTBAR_SLOTS,
    setHotbarSlot,
} from "../../game/game";
import { INVENTORY } from "../../game/inventory";
import { drawBlockRaw } from "../world";

const TRANSITION = 200;
const BG_OPACITY = 0.75;

const INVENTORY_PADDING = 5;
const INVENTORY_OUTER_PADDING = 20;

const BOX_BG = "#d6d6d6";
const BG = "#888888";
const BG_HOVER = "#9ea2a3";

const ITEMS_X = 9;
const ITEMS_Y = 8;
const INVENTORY_ITEM_SIZE = 55;
const INVENTORY_HOLDING_SIZE = 55;
const INVENTORY_ITEM_GAP = 10;

const BORDER_THICKNESS = 3;
const BORDER_COLOR = "#494949";

const SEPARATOR = 10;

const WIDTH = ITEMS_X * INVENTORY_ITEM_SIZE + (ITEMS_X - 1) * INVENTORY_ITEM_GAP + INVENTORY_PADDING * 2;
const BOX_WIDTH = WIDTH + INVENTORY_OUTER_PADDING * 2;

const HEIGHT = ITEMS_Y * INVENTORY_ITEM_SIZE + (ITEMS_Y - 1) * INVENTORY_ITEM_GAP + INVENTORY_PADDING * 2;
const HOTBAR_HEIGHT = INVENTORY_ITEM_SIZE + INVENTORY_PADDING * 2;
const BOX_HEIGHT = HEIGHT + SEPARATOR + HOTBAR_HEIGHT + INVENTORY_OUTER_PADDING * 2;

const OX = w / 2 - BOX_WIDTH / 2;
const OY = h / 2 - BOX_HEIGHT / 2;

export class Inventory extends GameObject {
    _show = false;
    private _isFadingOut = false;
    private _transitionTime = 0;

    private _holding: TwoNums = [-1, -1];

    private _hoverLocation: TwoNums = [0, 0];
    private _hoverZone: "hotbar" | "grid" | "none" = "none";
    private _hoverText = "";

    constructor() {
        super();
    }

    private _getBlockAtGridPos(gp: TwoNums) {
        let i = gp[1] * ITEMS_X + gp[0];
        return INVENTORY[i];
    }

    private _handleMouse() {
        let m = getMouse(true);

        const gridRect = [OX + INVENTORY_OUTER_PADDING, OY + INVENTORY_OUTER_PADDING, WIDTH, HEIGHT] as FourNums;
        if (basicPointInRect(...m, ...gridRect)) {
            this._hoverZone = "grid";
            // find currently hovered slot
            let slotX = Math.floor((m[0] - gridRect[0]) / (INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP));
            let slotY = Math.floor((m[1] - gridRect[1]) / (INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP));
            this._hoverLocation = [slotX, slotY];

            if (getKeyDown("mouse1")) {
                if (getKey("shift")) {
                    let empty = firstEmptyHotbarSlot();
                    if (empty > -1) {
                        let b = this._getBlockAtGridPos(this._hoverLocation);
                        if (b) {
                            setHotbarSlot(empty, b);
                        }
                    }
                } else {
                    let b = this._getBlockAtGridPos(this._hoverLocation);
                    if (b) {
                        this._holding = [...b];
                    } else {
                        this._holding = EMPTY_INV_SLOT;
                    }
                }
            }
            for (const [ind, key] of HOTBAR_SELECT_KEYS) {
                if (getKeyDown(key)) {
                    let b = this._getBlockAtGridPos(this._hoverLocation);
                    if (b) {
                        setHotbarSlot(ind, b);
                    }
                }
            }
        } else {
            const hotbarRect = [
                OX + INVENTORY_OUTER_PADDING,
                OY + INVENTORY_OUTER_PADDING + HEIGHT + SEPARATOR,
                WIDTH,
                HOTBAR_HEIGHT,
            ] as FourNums;
            if (basicPointInRect(...m, ...hotbarRect)) {
                this._hoverZone = "hotbar";
                // find currently hovered slot
                let slot = Math.floor((m[0] - hotbarRect[0]) / (INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP));
                this._hoverLocation = [slot, -1];

                if (getKeyDown("mouse1")) {
                    if (getKey("shift")) {
                        setHotbarSlot(slot, EMPTY_INV_SLOT);
                    } else {
                        if (this._holding) {
                            let e = [...hotbar[slot]] as TwoNums;
                            setHotbarSlot(slot, [...this._holding]);
                            this._holding = [...e];
                        } else {
                            if (hotbar[slot][0] != -1) {
                                this._holding = [...hotbar[slot]];
                                setHotbarSlot(slot, EMPTY_INV_SLOT);
                            }
                        }
                    }
                }
            } else {
                this._hoverZone = "none";
                if (getKeyDown("mouse1")) {
                    this._holding = EMPTY_INV_SLOT;
                }
            }
        }
    }

    update() {
        if (!this._show) return;

        this._handleMouse();
    }

    //#region drawing
    private _getTransition() {
        if (this._isFadingOut) {
            return 1 - clamp(since(this._transitionTime) / TRANSITION);
        } else {
            return clamp(since(this._transitionTime) / TRANSITION);
        }
    }

    private _transition() {
        let t = easeOutCirc(this._getTransition());
        ctx.translate(0, h * (1 - t) * (this._isFadingOut ? -1 : 1));
    }

    private _drawBox() {
        d.rect(OX, OY, BOX_WIDTH, BOX_HEIGHT, BOX_BG);
        d.rect(OX + INVENTORY_OUTER_PADDING, OY + INVENTORY_OUTER_PADDING, WIDTH, HEIGHT, BG);
        d.rect(
            OX + INVENTORY_OUTER_PADDING,
            OY + INVENTORY_OUTER_PADDING + HEIGHT + SEPARATOR,
            WIDTH,
            HOTBAR_HEIGHT,
            BG,
        );

        if (this._hoverZone == "grid") {
            d.rect(
                OX + INVENTORY_OUTER_PADDING + this._hoverLocation[0] * (INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP),
                OY + INVENTORY_OUTER_PADDING + this._hoverLocation[1] * (INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP),
                INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP,
                INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP,
                BG_HOVER,
            );
        }

        if (this._hoverZone == "hotbar") {
            d.rect(
                OX + INVENTORY_OUTER_PADDING + this._hoverLocation[0] * (INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP),
                OY + INVENTORY_OUTER_PADDING + HEIGHT + SEPARATOR,
                INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP,
                HOTBAR_HEIGHT,
                BG_HOVER,
            );
        }
    }

    private _drawHotbar() {
        let cx = OX + INVENTORY_OUTER_PADDING + INVENTORY_PADDING;
        for (let i = 0; i < hotbar.length; i++) {
            const [type, subtype] = hotbar[i];
            drawBlockRaw(
                cx,
                OY + HEIGHT + INVENTORY_OUTER_PADDING + INVENTORY_PADDING + SEPARATOR,
                INVENTORY_ITEM_SIZE,
                INVENTORY_ITEM_SIZE,
                type,
                subtype,
            );
            cx += INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP;
        }
    }

    private _drawGrid() {
        let cx = OX + INVENTORY_OUTER_PADDING + INVENTORY_PADDING + INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP * 0.5;
        ctx.strokeStyle = BORDER_COLOR;
        ctx.lineWidth = BORDER_THICKNESS;
        for (let i = 0; i < ITEMS_X - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(cx, OY + INVENTORY_OUTER_PADDING);
            ctx.lineTo(cx, OY + INVENTORY_OUTER_PADDING + HEIGHT);
            ctx.stroke();
            cx += INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP;
        }
        let cy = OY + INVENTORY_OUTER_PADDING + INVENTORY_PADDING + INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP * 0.5;
        for (let i = 0; i < ITEMS_Y - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(OX + INVENTORY_OUTER_PADDING, cy);
            ctx.lineTo(OX + INVENTORY_OUTER_PADDING + WIDTH, cy);
            ctx.stroke();
            cy += INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP;
        }
    }

    private _drawHotbarLines() {
        let cx = OX + INVENTORY_OUTER_PADDING + INVENTORY_PADDING + INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP * 0.5;
        ctx.strokeStyle = BORDER_COLOR;
        ctx.lineWidth = BORDER_THICKNESS;
        for (let i = 0; i < ITEMS_X - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(cx, OY + INVENTORY_OUTER_PADDING + HEIGHT + SEPARATOR);
            ctx.lineTo(cx, OY + INVENTORY_OUTER_PADDING + HEIGHT + SEPARATOR + HOTBAR_HEIGHT);
            ctx.stroke();
            cx += INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP;
        }
    }

    private _drawBlockGrid() {
        let cx = 0;
        let cy = 0;

        for (const [t, st] of INVENTORY) {
            drawBlockRaw(
                OX + INVENTORY_OUTER_PADDING + INVENTORY_PADDING + cx * (INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP),
                OY + INVENTORY_OUTER_PADDING + INVENTORY_PADDING + cy * (INVENTORY_ITEM_SIZE + INVENTORY_ITEM_GAP),
                INVENTORY_ITEM_SIZE,
                INVENTORY_ITEM_SIZE,
                t,
                st,
            );
            cx++;
            if (cx == HOTBAR_SLOTS) {
                cx = 0;
                cy++;
            }
        }
    }

    draw() {
        if (!this._show) return;

        let t = this._getTransition();

        ctx.globalAlpha = BG_OPACITY * t;
        d.rect(0, 0, w, h, "black");
        ctx.globalAlpha = 1;

        ctx.save();
        this._transition();

        this._drawBox();
        this._drawGrid();
        this._drawHotbarLines();
        this._drawBlockGrid();
        this._drawHotbar();

        if (this._holding[0] != -1) {
            let mouse = getMouse(true);
            drawBlockRaw(
                mouse[0] - INVENTORY_HOLDING_SIZE / 2,
                mouse[1] - INVENTORY_HOLDING_SIZE / 2,
                INVENTORY_HOLDING_SIZE,
                INVENTORY_HOLDING_SIZE,
                ...this._holding,
            );
        }

        ctx.restore();
    }
    //#endregion

    //#region display
    private _setShow(s: boolean) {
        this._transitionTime = performance.now();
        if (!s) {
            this._isFadingOut = true;
            setTimeout(() => {
                this._show = s;
            }, TRANSITION);
        } else {
            this._isFadingOut = false;
            this._show = s;
        }
    }

    show() {
        this._setShow(true);
    }

    hide() {
        this._setShow(false);
    }

    toggle() {
        if (this._show) {
            this.hide();
        } else {
            this.show();
        }
    }
    //#endregion
}
