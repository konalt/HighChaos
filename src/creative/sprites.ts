import { loadImage } from "../lib/engine/engine";

const BLOCKSPRITES = ["dirt", "grass_overlay", "stone", "wood", "leaves", "planks"];

export const SPRITES: Map<string, HTMLImageElement> = new Map();

export async function loadBlockSprites() {
    for (const bspr of BLOCKSPRITES) {
        let img = await loadImage("creative/blocks/" + bspr + ".png");
        SPRITES.set(bspr, img);
    }
}
