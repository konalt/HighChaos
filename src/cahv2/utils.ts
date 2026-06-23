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
