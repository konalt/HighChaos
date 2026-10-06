import {
    Axis,
    deltaTime,
    getAxis,
    getKey,
    getMouse,
    h,
    loadImage,
    setScene,
    startTimer,
    timer,
    timerEnd,
    w,
} from "../../lib/engine/engine";
import { clamp, FourNums, lerpPositions, TwoNums, valueInRange } from "../../lib/engine/utils";
import { easeOutCirc } from "../../lib/engine/ease";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { SantaScene } from "./santascene";
import { Present } from "../objects/present";
import { Sack } from "../objects/sack";
import { LivesDisplay } from "../objects/lives";
import { ScoreDisplay } from "../objects/score";
import { GameOverScene } from "./gameover";
import { playSound } from "../../lib/engine/sound";

export class GameScene extends SantaScene {
    presents: Present[] = [];
    sack: Sack;

    livesDisplay: LivesDisplay;
    scoreDisplay: ScoreDisplay;

    gravity = 1;
    score = 0;
    lives = 10;
    powerup = false;

    constructor() {
        super();

        this.sack = new Sack();
        this.add(this.sack, 2);

        this.livesDisplay = new LivesDisplay();
        this.add(this.livesDisplay, UI_LAYER);

        this.scoreDisplay = new ScoreDisplay();
        this.add(this.scoreDisplay, UI_LAYER);

        this.presents = [];
        this.presents.push(this.createPresent()); // needed for loading tha image
    }

    createPresent(): Present {
        const p = new Present();
        p.randomize();
        this.add(p);
        return p;
    }

    doLevelup() {
        if (this.score % 5 == 0) {
            this.gravity += 0.1;
        }
        if (this.score % 10 == 0) {
            setTimeout(() => {
                this.presents.push(this.createPresent());
            }, 500);
        }
        if (this.score > 10 && Math.random() < 0.03 && !this.powerup) {
            playSound("sleighbells", 0.6);
            this.powerup = true;
            startTimer("powerup", 7000);
        }
    }

    update() {
        super.update();
        const catchXMin = this.sack.x - (this.sack.getStretch() * Sack.SackGrabWidth) / 2;
        const catchXMax = this.sack.x + (this.sack.getStretch() * Sack.SackGrabWidth) / 2;

        let i = 0;
        for (const p of this.presents) {
            if (!p.collected && valueInRange(p.x, catchXMin, catchXMax) && p.y > h - Sack.SackGrabHeightMin) {
                playSound("hohoho", 0.6);
                this.score++;
                this.doLevelup();
                p.collect();
            }
            if (p.y > h + 50) {
                this.lives--;
                if (this.lives == 0) {
                    setScene(new GameOverScene(), false, {
                        presents: this.score,
                    });
                }
                playSound("baby", 0.5);
                this.remove(p);
                this.presents[i] = this.createPresent();
            }
            i++;
        }

        timerEnd(
            "powerup",
            () => {
                this.powerup = false;
            },
            true,
        );

        this.livesDisplay.lives = this.lives;
        this.scoreDisplay.score = this.score;
    }

    async init() {
        await super.init();

        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.presents.push(this.createPresent());
            }, i * 500);
        }
    }
}
