import { MenuFont } from "../constants";
import * as c from "../engine";
import { ctx, d } from "../engine";
import { isUpperCase } from "../utils";

const Title = "HIGH chaos";
const FontSize = 120;
const LetterSwayDistance = 5;
const LetterSwayRate = 0.0005;
const LetterSpacing = 5 + LetterSwayDistance / 2;

const UpperColor = "#25bd25ff";
const LowerColor = "#ffffffff";

const RandomizedLetterSways = new Array(Title.length).fill(0).map(() => [Math.random(), Math.random()]);
const SwayOffsets = [0, 1].map(
    (i) => (RandomizedLetterSways.reduce((a, b) => a + b[i], 0) / Title.length) * LetterSwayDistance
);

let letters: HTMLImageElement[];
async function createLetters() {
    let letters: HTMLImageElement[] = [];
    c.useCanvas(1);

    c.setFont(MenuFont);
    ctx.font = c.font(FontSize, "900");

    for (const char of Title) {
        let measure = ctx.measureText(char);
        let w = measure.width + 5;
        let h = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + 5;
        c.canvas.width = w;
        c.canvas.height = h;

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isUpperCase(char) ? UpperColor : LowerColor;
        ctx.font = c.font(FontSize, "900");
        ctx.fillText(char, 0, h / 2);

        letters.push(await c.getCanvasImage(1));
    }

    c.useCanvas(0);

    return letters;
}

export async function preload() {
    letters = await createLetters();
}

export function draw(x: number, y: number) {
    const totalWidth = letters.reduce((a, b) => a + b.width + LetterSpacing, 0);

    ctx.save();
    ctx.translate(x - totalWidth / 2 + SwayOffsets[0], y + SwayOffsets[1]);
    let i = 0;
    for (const letter of letters) {
        const swayX =
            Math.cos(performance.now() * LetterSwayRate + RandomizedLetterSways[i][0] * Math.PI) * LetterSwayDistance;
        const swayY =
            Math.cos(performance.now() * LetterSwayRate + RandomizedLetterSways[i][1] * Math.PI) * LetterSwayDistance;
        ctx.drawImage(letter, swayX, swayY);
        ctx.translate(letter.width + LetterSpacing, 0);
        i++;
    }
    ctx.restore();
}
