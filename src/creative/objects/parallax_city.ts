import { w, h, ctx, globalTimer } from "../../lib/engine/engine";

// TODO: make this work good

const color = "#5f5f5f";

const minHeight = 300;
const maxHeight = 800;
const heightRange = maxHeight - minHeight;

const buildingCount = 16;
const buildingWidth = w / buildingCount;

const buildings: [number, number][] = new Array(buildingCount)
    .fill(0)
    .map(() => [buildingWidth, minHeight + Math.random() * heightRange]);

export function draw(layer: number) {
    ctx.save();

    ctx.translate(-((globalTimer * (1 - Math.log10(layer))) / 10) % w, 0);

    let a = ((10 - layer) / 10) * 0.5 + 0.4;
    ctx.fillStyle = `rgb(${a * 255}, ${a * 255}, ${a * 255})`;
    ctx.beginPath();

    let x = 0;
    ctx.moveTo(x, buildings[0][1]);
    x += buildings[0][0];
    ctx.lineTo(x, buildings[0][1]);
    for (const building of buildings.slice(1)) {
        ctx.lineTo(x, building[1]);
        x += building[0];
        ctx.lineTo(x, building[1]);
    }
    // second loop
    for (const building of buildings) {
        ctx.lineTo(x, building[1]);
        x += building[0];
        ctx.lineTo(x, building[1]);
    }

    ctx.lineTo(x, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    ctx.fill();

    ctx.restore();
}
