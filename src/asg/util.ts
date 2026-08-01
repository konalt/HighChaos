import { distance } from "../lib/engine/utils";

export function circlesIntersect(c1x: number, c1y: number, c1r: number, c2x: number, c2y: number, c2r: number) {
    return distance(c1x, c1y, c2x, c2y) <= c1r + c2r;
}
