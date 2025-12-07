import { ctx } from "../engine";
import { lerp, lerpPositions } from "../utils";

const SegmentDeltaX = 50;
const SegmentDeltaY = 20;

export function draw(x: number, y: number, length: number) {
    if (length <= 0) return;
    length += 1;

    ctx.beginPath();
    ctx.moveTo(x, y - SegmentDeltaY / 2);

    let isDown = false;
    let lx = x;
    let ly = y;
    for (let i = 0; i < Math.floor(length); i++) {
        lx = x + i * SegmentDeltaX;
        ly = y + SegmentDeltaY * (isDown ? 0.5 : -0.5);
        ctx.lineTo(lx, ly);
        isDown = !isDown;
    }

    const d = length % 1;
    const dx = d * SegmentDeltaX;
    const dy = d * SegmentDeltaY;
    ctx.lineTo(lx + dx, ly + dy * (isDown ? 1 : -1));

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
}
