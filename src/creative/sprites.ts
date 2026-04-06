import { canvas, ctx, d, loadImage, loadImageAbsolute, useCanvas } from "../lib/engine/engine";
import { NULLTEXTURE } from "../lib/ui/hcimage";

const BLOCKSPRITES = ["dirt", "grass_overlay", "stone", "wood", "leaves", "planks"];
const BLOCK_DARKEN = "rgba(21, 22, 24, 0.56)";

export const SPRITES: Map<string, HTMLImageElement> = new Map();

async function createDarkSprite(img: HTMLImageElement) {
    // set up canvas
    useCanvas(1);
    canvas.width = 16;
    canvas.height = 16;

    ctx.drawImage(img, 0, 0, 16, 16);
    d.rect(0, 0, 16, 16, BLOCK_DARKEN);

    let darkImage = await loadImageAbsolute(canvas.toDataURL("image/png"));

    // restore default
    useCanvas(0);

    return darkImage;
}

export async function loadBlockSprites() {
    for (const bspr of BLOCKSPRITES) {
        let img = await loadImage("creative/blocks/" + bspr + ".png");
        SPRITES.set(bspr, img);
        let dark = await createDarkSprite(img);
        SPRITES.set(bspr + "__dark", dark);
    }
}

export function getBlockSprite(id: string, dark = false): HTMLImageElement {
    return SPRITES.get(id + (dark ? "__dark" : "")) ?? NULLTEXTURE;
}
