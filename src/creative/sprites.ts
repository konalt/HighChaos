import { canvas, CanvasStyle, ctx, d, loadImage, loadImageAbsolute, useCanvas } from "../lib/engine/engine";
import { NULLTEXTURE } from "../lib/ui/hcimage";
import { BlockType, getBlockData } from "./game/blocks";

const BLOCKSPRITES = [
    "dirt",
    "grass_overlay",
    "stone",
    "wood",
    "leaves",
    "planks",
    "glass",
    "7:wool",
    "saul",
    "bricks",
    "cobblestone",
    "stonebricks",
    "furniture/table",
    "flower",
    "ladder",
    "platform",
];
const BLOCK_DARKEN = "rgba(27, 28, 31, 0.46)";
const SPRITE_SCALE = 3;
const SPRITE_SIZE = 16 * SPRITE_SCALE;

export const SPRITES: Map<string, HTMLImageElement> = new Map();

async function createDarkSprite(img: HTMLImageElement) {
    // set up canvas
    useCanvas(1);
    canvas.width = SPRITE_SIZE;
    canvas.height = SPRITE_SIZE;

    ctx.drawImage(img, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
    ctx.globalCompositeOperation = "source-atop";
    d.rect(0, 0, SPRITE_SIZE, SPRITE_SIZE, BLOCK_DARKEN);

    let darkImage = await loadImageAbsolute(canvas.toDataURL("image/png"));

    // restore default
    useCanvas(0);

    return darkImage;
}

async function createColorSprite(img: HTMLImageElement, color: CanvasStyle) {
    // set up canvas
    useCanvas(1);
    canvas.width = SPRITE_SIZE;
    canvas.height = SPRITE_SIZE;

    ctx.drawImage(img, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
    ctx.globalAlpha = 0.9;
    ctx.globalCompositeOperation = "multiply";
    d.rect(0, 0, SPRITE_SIZE, SPRITE_SIZE, color);

    let coloredImage = await loadImageAbsolute(canvas.toDataURL("image/png"));

    // restore default
    useCanvas(0);

    return coloredImage;
}

async function createScaledSprite(img: HTMLImageElement) {
    // set up canvas
    useCanvas(1);
    canvas.width = SPRITE_SIZE;
    canvas.height = SPRITE_SIZE;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, SPRITE_SIZE, SPRITE_SIZE);

    let scaled = await loadImageAbsolute(canvas.toDataURL("image/png"));

    // restore default
    useCanvas(0);

    return scaled;
}

export async function loadBlockSprites() {
    for (const bspr of BLOCKSPRITES) {
        if (bspr.split(":").length > 1) {
            let [ts, s] = bspr.split(":");
            let data = getBlockData(parseInt(ts));

            let template = await loadImage("creative/blocks/template/" + s + ".png");

            let scaled = await createScaledSprite(template);
            SPRITES.set(s, scaled);
            let dark = await createDarkSprite(scaled);
            SPRITES.set(s + "__dark", dark);

            let i = 0;
            for (const subtype of data.subtypes) {
                let colored = await createColorSprite(scaled, subtype[1]);
                SPRITES.set(`${s}__${i}`, colored);
                let dark = await createDarkSprite(colored);
                SPRITES.set(`${s}__${i}__dark`, dark);
                i++;
            }
        } else {
            let img = await loadImage("creative/blocks/" + bspr + ".png");
            let scaled = await createScaledSprite(img);
            SPRITES.set(bspr, scaled);
            let dark = await createDarkSprite(scaled);
            SPRITES.set(bspr + "__dark", dark);
        }
    }
}

export function getBlockSprite(id: string, dark = false): HTMLImageElement {
    return SPRITES.get(id + (dark ? "__dark" : "")) ?? NULLTEXTURE;
}
