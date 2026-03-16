import { ctx } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { Block, gameSettings } from "../game";
import { SPRITES } from "../sprites";

export class BlockObject extends GameObject {
    type: Block = Block.DIRT;

    constructor() {
        super();
    }

    draw() {
        let base: HTMLImageElement = NULLTEXTURE;
        let overlay: HTMLImageElement;
        switch (this.type) {
            case Block.DIRT:
                base = SPRITES.get("dirt");
                break;
            case Block.GRASS:
                base = SPRITES.get("dirt");
                overlay = SPRITES.get("grass_overlay");
                break;
            case Block.STONE:
                base = SPRITES.get("stone");
                break;
        }

        let _s = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(base, this.x, this.y, gameSettings.blockSize, gameSettings.blockSize);
        if (overlay) {
            ctx.drawImage(base, this.x, this.y, gameSettings.blockSize, gameSettings.blockSize);
        }
        ctx.imageSmoothingEnabled = _s;
    }
}
