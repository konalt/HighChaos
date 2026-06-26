import { CAHGame } from "./types";

export let currentGame: CAHGame;

export function setGame(game: CAHGame) {
    currentGame = game;
}
