import { addToAtlas } from "../lib/engine/engine";
import { createOffscreenCanvas } from "../lib/engine/utils";

export function blackCardReplace(text: string, replacements: string[] = []) {
    let noAsterisks = text.replace(/\*/g, "");
    let replaced = noAsterisks.replace(/%%%/g, (_, i) => {
        if (replacements[i]) return replacements[i];
        return "______";
    });
    return replaced;
}

export function whiteCardReplace(text: string) {
    if (["?", "!", "."].includes(text.charAt(text.length - 1))) {
        return text;
    } else {
        return text + ".";
    }
}

export const API_URL = (path: string) => {
    return "https://konalt.net:58996" + path;
};

export function generateEmptyAvatar() {
    const canvas = new OffscreenCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error(":3");

    // background
    ctx.fillStyle = "#ddd";
    ctx.fillRect(0, 0, 512, 512);

    const headY = 210;
    const headRad = 90;

    const bodyY = 535;
    const bodyRad = 200;

    // head n shoulders shampoo
    ctx.beginPath();
    ctx.moveTo(256, headY);
    ctx.arc(256, headY, headRad, 0, Math.PI * 2);

    ctx.moveTo(256, bodyY);
    ctx.arc(256, bodyY, bodyRad, 0, Math.PI * 2);

    ctx.fillStyle = "#555";
    ctx.fill();

    const img = canvas.transferToImageBitmap();
    addToAtlas(img, "emptyavatar");
    return img;
}

export function circularAvatar(avatar: HTMLImageElement | ImageBitmap, size = 256, outline = 4) {
    const [c, ctx] = createOffscreenCanvas(size, size);

    const avatarMask = new Path2D();
    avatarMask.moveTo(size, size / 2);
    avatarMask.arc(size / 2, size / 2, size / 2 - outline / 2, 0, Math.PI * 2);
    avatarMask.closePath();

    ctx.save();
    ctx.clip(avatarMask);
    ctx.drawImage(avatar, 0, 0, size, size);
    ctx.restore();

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = outline;
    ctx.stroke(avatarMask);

    return c.transferToImageBitmap();
}

export function bitmapToDataURL(img: ImageBitmap) {
    const [c, ctx] = createOffscreenCanvas(img.width, img.height);
    ctx.drawImage(img, 0, 0);

    return new Promise<string>((resolve, reject) => {
        c.convertToBlob().then((b) => {
            // OH NO FILEREADERSYNC IS ONLY AVAILABLE IN WORKERS
            // BETTER DO SOME JANKY CALLBACK SHIT!!!
            const r = new FileReader();

            r.onload = () => {
                resolve(r.result as string);
            };

            r.readAsDataURL(b);
        });
    });
}

export const IDBName = "CAHV2";
