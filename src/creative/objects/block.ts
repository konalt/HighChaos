import { ctx } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { NULLTEXTURE } from "../../lib/ui/hcimage";
import { SPRITES } from "../sprites";
import { BlockType } from "../game/blocks";
import { gameSettings } from "../game/settings";

export class BlockObject extends GameObject {
    type: BlockType = BlockType.DIRT;

    constructor() {
        super();
    }

    draw() {
        let base: HTMLImageElement = NULLTEXTURE;
        let overlay: HTMLImageElement | undefined;
        switch (this.type) {
            case BlockType.DIRT:
                base = SPRITES.get("dirt") ?? NULLTEXTURE;
                break;
            case BlockType.GRASS:
                base = SPRITES.get("dirt") ?? NULLTEXTURE;
                overlay = SPRITES.get("grass_overlay");
                break;
            case BlockType.STONE:
                base = SPRITES.get("stone") ?? NULLTEXTURE;
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
