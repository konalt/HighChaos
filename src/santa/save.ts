export function getSavedBest() {
    return parseInt(localStorage.getItem("santa_best")) || 0;
}

export function saveBest(score: number) {
    let b = getSavedBest();
    if (b >= score) return false;
    localStorage.setItem("santa_best", score.toString());
    return true;
}
