import { setResolution } from "./engine";

export const ResolutionOptions: [number, string][] = [
    [0.3, "Unplayable"],
    [0.5, "Very Low"],
    [0.7, "Low"],
    [0.85, "Medium"],
    [1, "High"],
    [1.5, "Very High"],
    [2, "Extreme"],
];

export type DetailLevel = 0 | 1 | 2 | 3;
export const DetailLevelNames = ["Minimal", "Low", "Medium", "High"];
export function detail(required = 3) {
    return required <= settings.detailLevel;
}

export interface Settings {
    resolution: number;
    smoothing: boolean;
    gradients: boolean;
    detailLevel: DetailLevel;
    easing: boolean;
}

export let settings: Settings = {
    resolution: 3,
    smoothing: true,
    gradients: true,
    detailLevel: 2,
    easing: true,
};

export function saveSettings() {
    localStorage.setItem("hc_settings", JSON.stringify(settings));
}

export function loadSettings() {
    let stored = localStorage.getItem("hc_settings");
    if (stored) {
        settings = JSON.parse(stored);
        setResolution(ResolutionOptions[settings.resolution][0]);
    } else {
        saveSettings();
    }
}

export function nextResolution() {
    settings.resolution++;
    if (settings.resolution >= ResolutionOptions.length) settings.resolution = 0;
    setResolution(ResolutionOptions[settings.resolution][0]);
}

export function prevResolution() {
    settings.resolution--;
    if (settings.resolution < 0) settings.resolution = ResolutionOptions.length - 1;
    setResolution(ResolutionOptions[settings.resolution][0]);
}

export function nextDetail() {
    settings.detailLevel++;
    if (settings.detailLevel >= 4) settings.detailLevel = 0;
}

export function prevDetail() {
    settings.detailLevel--;
    if (settings.detailLevel < 0) settings.detailLevel = 3;
}
