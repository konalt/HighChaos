export type LocalSettings = {
    enableBlockBreakEffects: boolean;
    resolution: number;
    volume: number;
};

const defaultLocalSettings: LocalSettings = {
    enableBlockBreakEffects: true,
    resolution: 0.8,
    volume: 0.8,
};

export let localSettings: LocalSettings = { ...defaultLocalSettings };

export function setLocalSettings(settings: Partial<LocalSettings>) {
    Object.assign(localSettings, settings);
}

export function resetDefaultLocalSettings() {
    localSettings = { ...defaultLocalSettings };
}
