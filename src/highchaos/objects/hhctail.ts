import { ctx } from "../../engine/engine";

const SegmentDeltaX = 50;
const SegmentDeltaY = 20;

export function draw(x: number, y: number, length: number, lengthInUnits = false, scale = 1) {
    const sdx = SegmentDeltaX * scale;
    const sdy = SegmentDeltaY * scale;

    if (length <= 0) return;
    if (lengthInUnits) {
        length /= sdx;
    }
    length += 1;

    ctx.beginPath();
    ctx.moveTo(x, y);

    let isDown = false;
    let lx = x;
    let ly = y;
    for (let i = 0; i < Math.floor(length); i++) {
        lx = x + i * sdx;
        ly = y + (isDown ? sdy : 0);
        ctx.lineTo(lx, ly);
        isDown = !isDown;
    }

    const d = length % 1;
    const dx = d * sdx;
    const dy = d * sdy;
    ctx.lineTo(lx + dx, ly + dy * (isDown ? 1 : -1));

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5 * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
}
