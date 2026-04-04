const FontWeights = ["ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold"];
const FontsWithWeights = ["Oxanium"];

export let defaultFontNames = ["Futuristic-Armour", "LeCristaldeLune"];

for (const wt of FontWeights) {
    for (const f of FontsWithWeights) {
        defaultFontNames.push(`${f}/${f}-${wt}`);
    }
}

export async function loadFonts(fonts?: string[]) {
    if (!fonts) fonts = defaultFontNames;
    for (const fn of fonts) {
        const f = new FontFace((fn.split("/").at(-1) ?? "").replace(/-/g, " "), `url("/fonts/${fn}.woff2")`);
        document.fonts.add(f);
        f.load();
    }
    return document.fonts.ready;
}
