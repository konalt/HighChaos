import { d, debugMode, font, w } from "../../lib/engine/engine";
import { GameObject } from "../../lib/engine/object";
import { TwoNums } from "../../lib/engine/utils";
import { blocks } from "../game/blocks";
import { ply } from "../game/player";
import { gameSettings } from "../game/settings";
import { drawBlock, getWorldPos } from "./worldlayer2";

export class World extends GameObject {
    constructor() {
        super();
    }

    draw() {
        if (!ply) return;

        for (const blk of blocks) {
            if (blk.layer == 2) continue;
            drawBlock(
                blk,
                [this.scene.camera.x, this.scene.camera.y],
                (w / this.scene.camera.zoom) * 0.5 + gameSettings.blockSize,
            );

            if (debugMode) {
                d.text(
                    ...(getWorldPos([blk.gx, blk.gy]).map((n) => n + gameSettings.blockSize / 2) as TwoNums),
                    blk.layer.toString(),
                    "red",
                    font(24),
                    "center",
                );
            }
        }
    }
}
