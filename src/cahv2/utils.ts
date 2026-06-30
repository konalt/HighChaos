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

    return canvas.transferToImageBitmap();
}

export const IDBName = "CAHV2";
