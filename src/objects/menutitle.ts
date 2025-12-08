import { MenuFontTitle } from "../constants";
import * as c from "../engine";
import { ctx, d } from "../engine";
import { detail } from "../options";
import { isUpperCase } from "../utils";

const Title = "HIGH chaos";
const FontSize = 120;
const LetterSwayDistance = 5;
const LetterSwayRate = 0.0005;
const LetterSpacing = 5 + LetterSwayDistance / 2;
const PreloadMargin = 20;

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

    c.setFont(MenuFontTitle);
    ctx.font = c.font(FontSize, "900");

    for (const char of Title) {
        let measure = ctx.measureText(char);
        let w = measure.width + PreloadMargin;
        let h = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + PreloadMargin;
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

let totalWidth = 0;
export async function preload() {
    letters = await createLetters();
    totalWidth = letters.reduce((a, b) => a + b.width + LetterSpacing - PreloadMargin, 0);
}

export function draw(x: number, y: number) {
    ctx.save();
    ctx.translate(x - totalWidth / 2 + SwayOffsets[0], y + SwayOffsets[1]);
    let i = 0;
    for (const letter of letters) {
        let swayX = 0;
        let swayY = 0;
        if (detail(2)) {
            swayX =
                Math.cos(performance.now() * LetterSwayRate + RandomizedLetterSways[i][0] * Math.PI) *
                LetterSwayDistance;
            swayY =
                Math.cos(performance.now() * LetterSwayRate + RandomizedLetterSways[i][1] * Math.PI) *
                LetterSwayDistance;
        }
        ctx.drawImage(letter, swayX, swayY);
        ctx.translate(letter.width + LetterSpacing - PreloadMargin, 0);
        i++;
    }
    ctx.restore();
}
