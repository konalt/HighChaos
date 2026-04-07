import { canvas, CanvasStyle, ctx, d, loadImage, loadImageAbsolute, useCanvas } from "../lib/engine/engine";
import { NULLTEXTURE } from "../lib/ui/hcimage";
import { BlockType, getBlockData } from "./game/blocks";

const BLOCKSPRITES = ["dirt", "grass_overlay", "stone", "wood", "leaves", "planks", "glass", "7:wool"];
const BLOCK_DARKEN = "rgba(15, 20, 29, 0.46)";

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

async function createColorSprite(img: HTMLImageElement, color: CanvasStyle) {
    // set up canvas
    useCanvas(1);
    canvas.width = 16;
    canvas.height = 16;

    ctx.drawImage(img, 0, 0, 16, 16);
    ctx.globalAlpha = 0.9;
    ctx.globalCompositeOperation = "multiply";
    d.rect(0, 0, 16, 16, color);

    let coloredImage = await loadImageAbsolute(canvas.toDataURL("image/png"));

    // restore default
    useCanvas(0);

    return coloredImage;
}

export async function loadBlockSprites() {
    for (const bspr of BLOCKSPRITES) {
        if (bspr.split(":").length > 1) {
            let [ts, s] = bspr.split(":");
            let data = getBlockData(parseInt(ts));

            let template = await loadImage("creative/blocks/template/" + s + ".png");
            SPRITES.set(s, template);

            let i = 0;
            for (const subtype of data.subtypes) {
                let colored = await createColorSprite(template, subtype[1]);
                SPRITES.set(`${s}__${i}`, colored);
                let dark = await createDarkSprite(colored);
                SPRITES.set(`${s}__${i}__dark`, dark);
                i++;
            }
        } else {
            let img = await loadImage("creative/blocks/" + bspr + ".png");
            SPRITES.set(bspr, img);
            let dark = await createDarkSprite(img);
            SPRITES.set(bspr + "__dark", dark);
        }
    }
}

export function getBlockSprite(id: string, dark = false): HTMLImageElement {
    return SPRITES.get(id + (dark ? "__dark" : "")) ?? NULLTEXTURE;
}
