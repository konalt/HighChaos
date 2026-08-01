import { currentScene, deltaTime, startTimer, timerEnd } from "../../lib/engine/engine";
import { TwoNums, uuidv4 } from "../../lib/engine/utils";
import { ASGBullet } from "../objects/bullet";
import { ASGEnemy } from "../objects/enemy";
import { ASGPlayer } from "../objects/player";
import { ASGInGameScene } from "../scenes/ingame";

export interface ASGBPContext {
    deltaTime: number;
    enemy: ASGEnemy;
    player: ASGPlayer;
    origin: TwoNums;
    target: TwoNums;
}

export type ASGBPFunction = (ctx: ASGBPContext) => void;

export abstract class ASGBulletPattern {
    private _intervals: Map<string, [number, ASGBPFunction]> = new Map();

    protected bullets: ASGBullet[] = [];

    constructor() {}

    /**
     * This runs every frame. You may modify this function as you wish.
     * @param context The context.
     */
    protected abstract update(ctx: ASGBPContext): void;

    /**
     * This runs when the enemy spawns.
     * @param context The context.
     */
    protected abstract start(ctx: ASGBPContext): void;

    /**
     * Every t milliseconds, run run().
     * This function should be executed in update().
     * Unlike regular setInterval, this respects deltaTime.
     * @param run Code to run.
     * @param t Interval in ms.
     */
    protected setInterval(run: ASGBPFunction, t: number) {
        const id = uuidv4();

        this._intervals.set(id, [t, run]);

        startTimer(id, t);

        return id;
    }

    /**
     * Cancel the interval returned by ASGBulletPattern.setInterval.
     * @param id The interval ID.
     */
    protected clearInterval(id: string) {
        if (!this._intervals.has(id)) throw new Error("unknown interval " + id);

        this._intervals.delete(id);
    }

    externalUpdate(ctx: ASGBPContext) {
        // do the provided update
        this.update(ctx);

        for (const [id, [t, fn]] of this._intervals) {
            timerEnd(
                id,
                () => {
                    fn(ctx);
                    startTimer(id, t);
                },
                false,
            );
        }
    }

    externalStart(ctx: ASGBPContext) {
        // do the provided start
        this.start(ctx);
    }
}

export function createContext(e: ASGEnemy): ASGBPContext {
    if (!(e.scene instanceof ASGInGameScene)) throw new Error("must create context in ingame scene");

    return {
        deltaTime: deltaTime,
        enemy: e,
        origin: [e.x, e.y],
        target: [e.scene.player.x, e.scene.player.y],
        player: e.scene.player,
    };
}
