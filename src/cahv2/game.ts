import { CAHGame, CAHPlayer } from "./types";

export let currentGame: CAHGame;

export function setGame(game: CAHGame) {
    currentGame = game;
}

export let currentPlayer: CAHPlayer;

export function setPlayer(ply: CAHPlayer) {
    currentPlayer = ply;
}
