import { easeInCirc, easeOutCirc } from "../../lib/engine/ease";
import { Axis, ctx, d, deltaTime, getAxis, getKey, h, loadImage, timer, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { clamp } from "../../lib/engine/utils";
import { NULLTEXTURE } from "../../lib/ui/hcimage";

export class Sack extends GameObject {
    private _img: HTMLImageElement;

    static SackGrabWidth = 150;
    static SackGrabHeightMin = 200;
    static SackSpeed = 500;
    static SackSprintMult = 2;

    static PowerUpMargin = 0.1;
    static PowerUpScale = 2;

    constructor() {
        super();

        this._img = NULLTEXTURE;
        this.x = w / 2;
        this.y = h;
    }

    getStretch() {
        const pu = timer("powerup");
        if (pu) {
            if (pu < Sack.PowerUpMargin) {
                return 1 + easeOutCirc(pu / Sack.PowerUpMargin) * Sack.PowerUpScale;
            } else if (pu > 1 - Sack.PowerUpMargin) {
                return 1 + easeInCirc(1 - (pu - (1 - Sack.PowerUpMargin)) / Sack.PowerUpMargin) * Sack.PowerUpScale;
            } else {
                return 1 + Sack.PowerUpScale;
            }
        }
        return 1;
    }

    update() {
        let a = getAxis(Axis.Horizontal);
        this.x += a * deltaTime * Sack.SackSpeed * (getKey("shift") ? Sack.SackSprintMult : 1);
        this.x = clamp(this.x, 0, w);
    }

    draw() {
        // Drawing code goes here
        let stretch = this.getStretch();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(stretch, 1);
        d.quickImage(this._img, 0, 0, 0.4, "bc");
        ctx.restore();
    }

    init() {
        // Init code goes here (if needed)
    }

    async load() {
        this._img = await loadImage("santa/sack.png");
    }
}
