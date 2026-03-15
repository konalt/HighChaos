const FontWeights = ["ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold"];
const FontsWithWeights = ["Oxanium"];

let fontNames = ["Futuristic-Armour", "Le Cristal de Line"];

for (const wt of FontWeights) {
    for (const f of FontsWithWeights) {
        fontNames.push(`${f}/${f}-${wt}`);
    }
}

export async function loadFonts() {
    for (const fn of fontNames) {
        const f = new FontFace(fn.split("/").at(-1).replace(/-/g, " "), `url("/fonts/${fn}.woff2")`);
        document.fonts.add(f);
        f.load();
    }
    return document.fonts.ready;
}
