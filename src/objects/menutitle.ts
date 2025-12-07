import * as c from "../engine";
import { ctx, d } from "../engine";

const Title = "HIGH chaos";
const FontSize = 120;
const LetterSwayDistance = 10;
const LetterSwayRate = 0.0005;
const LetterSpacing = 5 + LetterSwayDistance / 2;

const RandomizedLetterSways = new Array(10).fill(0).map(() => [Math.random(), Math.random()]);

let letters: HTMLImageElement[];
async function createLetters() {
    let letters: HTMLImageElement[] = [];
    c.useCanvas(1);

    c.setFont("'Futuristic Armour', sans-serif");
    ctx.font = c.font(FontSize, "900");

    for (const char of Title) {
        let measure = ctx.measureText(char);
        let w = measure.width + 5;
        let h = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + 5;
        c.canvas.width = w;
        c.canvas.height = h;

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
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
    ctx.translate(x - totalWidth / 2, y);
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
