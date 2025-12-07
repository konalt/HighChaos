const fontNames = ["Futuristic-Armour"];

export async function loadFonts() {
    for (const fn of fontNames) {
        const f = new FontFace(fn.replace(/-/g, " "), `url("fonts/${fn}.woff")`);
        document.fonts.add(f);
        f.load();
    }
    return document.fonts.ready;
}
