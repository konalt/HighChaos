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

// new advanced method
export interface HCFontFace {
    style: "normal" | "italic";
    weight: number;
    src: string;
}

export interface HCFont {
    name: string;
    faces: HCFontFace[];
}

export async function loadFontsAdvanced(fonts: HCFont[]) {
    for (const font of fonts) {
        for (const face of font.faces) {
            const f = new FontFace(font.name, `url("${face.src}")`, {
                display: "swap",
                style: face.style,
                weight: face.weight.toString(),
            });
            document.fonts.add(f);
            f.load();
        }
    }
    return document.fonts.ready;
}
