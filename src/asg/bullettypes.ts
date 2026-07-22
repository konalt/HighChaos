export enum BulletType {
    BallSmall,
    BallBig,
    PillSmall,
    PillBig,
}

export interface BulletTypeData {
    hitboxRadius: number;
    defaultRenderScale: number;
}

export const BULLET_DATA: Record<BulletType, BulletTypeData> = {
    [BulletType.BallSmall]: {
        hitboxRadius: 20,
        defaultRenderScale: 0.7,
    },
    [BulletType.BallBig]: {
        hitboxRadius: 20,
        defaultRenderScale: 0.7,
    },
    [BulletType.PillBig]: {
        hitboxRadius: 20,
        defaultRenderScale: 0.7,
    },
    [BulletType.PillSmall]: {
        hitboxRadius: 20,
        defaultRenderScale: 0.7,
    },
};
