import { ctx, d, deltaTime, getMouse, h, w } from "../../../lib/engine/engine";
import { GameObject } from "../../../lib/engine/object";
import { TwoNums } from "../../../lib/engine/utils";
import { COLOR } from "../../color";

export interface Particle {
    x: number;
    y: number;
    z: number;
    dx: number;
    dy: number;
}

const ParticleSize = 10;
const ParticleSpeed = 30;
const ParticleAlpha = 0.25;
const ParticleColor = "#d896ff";
const ParticleCount = 50;
const Margin = 50;
const Background = "#110e13";

export class CAHInGameBackground extends GameObject {
    particles: Particle[] = [];
    private _grad: CanvasGradient;

    constructor(particles: Particle[] = []) {
        super();

        this._grad = this._createGradient();
        this.particles = particles;
    }

    init() {
        if (this.particles.length == 0) {
            this._populate();
        }
    }

    private _createGradient() {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.75);

        // color stops
        g.addColorStop(0, COLOR.backgroundLight);
        g.addColorStop(1, COLOR.backgroundDark);

        return g;
    }

    private _populate() {
        this.particles = [];
        for (let i = 0; i < ParticleCount; i++) {
            const pos = this._randomIBCoords();
            const dv = this._randomDVector();
            this.particles.push({
                x: pos[0],
                y: pos[1],
                z: (Math.random() + 0.2) * 0.8,
                dx: dv[0],
                dy: dv[1],
            });
        }
    }

    private _randomOOBCoords(): TwoNums {
        let x = Math.random() * Margin + ParticleSize;
        if (Math.random() < 0.5) {
            x = -x;
        } else {
            x = w + x;
        }
        let y = Math.random() * Margin + ParticleSize;
        if (Math.random() < 0.5) {
            y = -y;
        } else {
            y = h + y;
        }
        return [x, y];
    }

    private _randomDVector(): TwoNums {
        const d = () => {
            return Math.random() + 0.5 * Math.sign(Math.random() - 0.5);
        };
        return [d(), d()];
    }

    private _randomIBCoords(): TwoNums {
        return [Math.random() * w, Math.random() * h];
    }

    private _drawParticle(p: Particle) {
        // move to where it is
        ctx.save();
        ctx.translate(p.x, p.y);

        // scale it based on the z
        ctx.scale(p.z, p.z);

        // alpha
        ctx.globalAlpha = p.z * ParticleAlpha;

        // draw the particle
        d.circ(0, 0, ParticleSize, ParticleColor);

        // clean up
        ctx.restore();
    }

    private _updateParticle(p: Particle) {
        p.x += p.dx * ParticleSpeed * deltaTime * p.z;
        p.y += p.dy * ParticleSpeed * deltaTime * p.z;

        if (p.x > w + Margin || p.y > h + Margin || p.x < -Margin || p.y < -Margin) {
            let coords = this._randomOOBCoords();
            let vec = this._randomDVector();
            [p.x, p.y] = coords;
            [p.dx, p.dy] = vec;
        }
    }

    update() {
        for (const p of this.particles) {
            this._updateParticle(p);
        }
    }

    draw() {
        ctx.save();
        //ctx.translate(...getMouse(true));
        ctx.translate(w / 2, h / 2);
        d.rect(-w, -h, w * 2, h * 2, this._grad);
        ctx.restore();

        for (const p of this.particles) {
            this._drawParticle(p);
        }
    }
}
