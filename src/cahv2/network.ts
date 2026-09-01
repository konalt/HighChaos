import * as sio from "socket.io-client";
import { currentScene, setScene, startTimer } from "../lib/engine/engine";
import { CAHMainMenuScene } from "./scenes/mainmenu";
import { CAHGameState, deserializePlayer } from "./types";
import { currentGame, currentPlayer } from "./game";
import { CAHInGameBaseScene } from "./scenes/ingamebase";
import { CAHIGLobbyState } from "./scenes/iglobby";
import { CAHIGPlayState } from "./scenes/igplay";
import { playSound } from "../lib/engine/sound";
import { CAHIGVoteState } from "./scenes/igvote";

export let socket: sio.Socket | null = null;

let isReloading = false;

export function initialize() {
    window.addEventListener("beforeunload", () => {
        isReloading = true;
    });

    return new Promise<sio.Socket>((resolve, reject) => {
        if (socket && socket.connected) return resolve(socket);

        const m = new sio.Manager("https://konalt.net:58996", {
            //reconnection: false, // i know i know!!!
        });
        const s = m.socket("/");

        s.on("connect_error", (e) => {
            reject(e);
        });

        s.on("disconnect", async (e) => {
            // its fine its totally fine ignore it.
            if (isReloading) return;

            // this.. is where magic style
            const s = new CAHMainMenuScene();
            await setScene(s);
            s.error.show(`Unfortunately, you were disconnected due to the error "${e}" :( Please report this!`, 10_000); // 10s

            playSound("ui_error");
        });

        s.on("ply_join", (plyData) => {
            if (!currentGame) return;

            const ply = deserializePlayer(plyData);

            if (currentGame.players.has(ply.id)) {
                throw new Error("what????");
            }

            currentGame.players.set(ply.id, ply);

            if (currentScene instanceof CAHInGameBaseScene) {
                startTimer("plyj" + ply.id, 300);
                currentScene.playerList.reloadPlayers();

                playSound("ui/player_join");
            }
        });

        s.on("ply_leave", (id) => {
            if (!currentGame) return;

            if (!currentGame.players.has(id)) {
                throw new Error("unknown player left");
            }

            currentGame.players.delete(id);

            if (currentScene instanceof CAHInGameBaseScene) {
                currentScene.playerList.reloadPlayers();
            }
        });

        //#region card shit
        s.on("blackcard", (card: string) => {
            if (!currentGame) return;

            console.log("new black card: " + card);

            currentGame.currentBlackCard = card;
        });

        s.on("whitecards", (cards: string[]) => {
            if (!currentGame) return;
            if (!currentPlayer) return;

            console.log("new white cards", cards);

            currentPlayer.cardsWhite = cards;
        });
        //#endregion

        //#region game flow shit
        s.on("countdown_start", (duration) => {
            if (!currentGame) return;

            console.log(`start countdown duration ${duration}`);

            if (currentScene instanceof CAHIGLobbyState) {
                currentScene.countdown.startCountdown(duration);
            }
        });

        s.on("start", () => {
            if (!currentGame) return;

            // game starting!!!!
            console.log("game starting!");

            currentGame.state = CAHGameState.Play;

            if (currentScene instanceof CAHIGLobbyState) {
                currentScene.finish(new CAHIGPlayState(currentScene.background.particles));
            }
        });

        s.on("cardsubmit", ([id, card]) => {
            if (!currentGame) return;
            // submitting player
            const sply = currentGame.players.get(id);
            if (!sply) return;

            console.log(`player ${id} submitted ${card}`);

            sply.chosenWhiteCard = card;

            if (currentScene instanceof CAHIGPlayState) {
                currentScene.playerSubmitCounter.updateCurrentPlayers((ply) => !!ply.chosenWhiteCard);
            }
        });

        s.on("startvoting", () => {
            if (!currentGame) return;

            console.log("voting time");

            currentGame.state = CAHGameState.Vote;

            if (currentScene instanceof CAHIGPlayState) {
                currentScene.finish(new CAHIGVoteState(currentScene.background.particles));
            }
        });

        s.on("vote", ([vid, tid]) => {
            if (!currentGame) return;
            // voting player
            const vply = currentGame.players.get(vid);
            if (!vply) return;

            console.log(`player ${vid} voted for ${tid}`);

            vply.voteTarget = tid;

            if (currentScene instanceof CAHIGVoteState) {
                currentScene.voteCounter.updateCurrentPlayers((ply) => !!ply.voteTarget);
            }
        });
        //#endregion

        s.once("ack", () => {
            socket = s;
            resolve(socket);
        });
    });
}
