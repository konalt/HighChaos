import { currentScene } from "../lib/engine/engine";
import { getAngle, TwoNums } from "../lib/engine/utils";
import { BulletType } from "./bullettypes";
import { ASGLayer } from "./layers";
import { ASGBullet } from "./objects/bullet";
import { ASGInGameScene } from "./scenes/ingame";

export interface BulletSpawnData {
    type: BulletType;
    isPlayerBullet: boolean;
    scale: number;
    speed: number;
    angularVelocity: number;
}

export const DEFAULT_BULLET_SPAWN_DATA: BulletSpawnData = {
    type: BulletType.BallSmall,
    isPlayerBullet: false,
    scale: 1,
    speed: 400,
    angularVelocity: 0,
};

/**
 * apply default shit
 * @param data a bullet spawn data
 */
function unpartial(data: Partial<BulletSpawnData>) {
    const o = DEFAULT_BULLET_SPAWN_DATA;
    Object.assign(o, data);
    return o;
}

/**
 * Shoot a bullet in a straight line
 * @param origin the start position of the bullet
 * @param angle the angle to shoot the bullet at. use getAngle to shoot towards a TwoNums
 * @param type the BulletType
 * @param speed speed of the bullet
 * @param scale how big the bullet should be
 * @param isPlayerBullet whether or not the player fired this bullet
 */
export function basicShootBullet(spawnData: Partial<BulletSpawnData>, origin: TwoNums, angle: number): ASGBullet {
    if (!(currentScene instanceof ASGInGameScene)) throw "Must be run in ASGInGameScene";

    // get the data
    const sd = unpartial(spawnData);

    // create the bullet object
    const bulletObject = new ASGBullet();
    bulletObject.x = origin[0];
    bulletObject.y = origin[1];
    bulletObject.angle = angle;

    bulletObject.type = sd.type;
    bulletObject.velocity = [sd.speed, 0]; // straight line, rotation is handled by the angle
    bulletObject.scale = sd.scale;
    bulletObject.isPlayerBullet = sd.isPlayerBullet;
    bulletObject.angularVelocity = sd.angularVelocity;

    // add it and return it
    currentScene.addBullet(bulletObject);
    return bulletObject;
}

export function bulletArc(
    spawnData: Partial<BulletSpawnData>,
    center: TwoNums,
    count: number,
    radius = 0,
    angleOffset = 0,
    startAngle = 0,
    endAngle = Math.PI * 2,
): ASGBullet[] {
    if (!(currentScene instanceof ASGInGameScene)) throw "Must be run in ASGInGameScene";

    // angle between bullets
    const deltaTheta = (endAngle - startAngle) / count;

    const spawnedBullets = [];

    let theta = startAngle + angleOffset;
    for (let i = 0; i < count; i++) {
        if (radius == 0) {
            const b = basicShootBullet(spawnData, center, theta);
            spawnedBullets.push(b);
        } else {
            // spawn position
            const x = center[0] + Math.cos(theta) * radius;
            const y = center[1] + Math.sin(theta) * radius;

            const b = basicShootBullet(spawnData, [x, y], theta);

            spawnedBullets.push(b);
        }

        theta += deltaTheta;
    }

    // return the collected bullets
    return spawnedBullets;
}
