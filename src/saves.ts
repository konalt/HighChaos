export interface Save {
    empty: boolean;
}

export function createEmptySave(): Save {
    return {
        empty: true,
    };
}

export let savedGames: Save[] = [createEmptySave(), createEmptySave(), createEmptySave()];

export function save(save: Save, slot: number) {
    savedGames[slot] = save;
    localStorage.setItem("save", JSON.stringify(savedGames));
}

export function load() {
    savedGames = JSON.parse(localStorage.getItem("save"));
}
