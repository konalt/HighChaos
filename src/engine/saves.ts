import { game } from "./engine";

export type Save = Record<string, any>;

export function createEmptySave(): Save {
    return {
        empty: true,
    };
}

export let savedGames: Save[] = [createEmptySave(), createEmptySave(), createEmptySave()];

let currentSave = -1;
export function setCurrentSave(index: number) {
    currentSave = index;
}

export function save(save: Save, slot: number) {
    savedGames[slot] = save;
    localStorage.setItem(`save_${game}`, JSON.stringify(savedGames));
}

export function load() {
    savedGames = JSON.parse(localStorage.getItem(`save_${game}`));
}
