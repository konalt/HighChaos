import * as sio from "socket.io-client";
import { currentScene, setScene, startTimer } from "../lib/engine/engine";
import { CAHMainMenuScene } from "./scenes/mainmenu";
import { CAHGameState, CAHRoundResults, deserializePlayer } from "./types";
import { currentGame, currentPlayer } from "./game";
import { CAHInGameBaseScene } from "./scenes/ingamebase";
import { CAHIGLobbyState } from "./scenes/iglobby";
import { CAHIGPlayState } from "./scenes/igplay";
import { playSound } from "../lib/engine/sound";
import { CAHIGVoteState } from "./scenes/igvote";
import { CAHIGVoteResultsState } from "./scenes/igvoteresults";
import { Reaction } from "./reactions";
import { CAHIGFinalScoreState } from "./scenes/igfinalscore";

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

            playSound("ui_error", 0.3);
        });

        s.on("ply_join", async (plyData) => {
            if (!currentGame) return;

            const ply = await deserializePlayer(plyData);

            if (currentGame.players.has(ply.id)) {
                throw new Error("what????");
            }

            currentGame.players.set(ply.id, ply);

            if (currentScene instanceof CAHInGameBaseScene) {
                startTimer("plyj" + ply.id, 300);
                currentScene.playerList.reloadPlayers();

                playSound("ui/player_join", 0.8);
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

            if (id != currentPlayer.id) {
                playSound("ui/pop", 0.3);
            }

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

            if (vid != currentPlayer.id) {
                playSound("ui/pop", 0.3);
            }

            if (currentScene instanceof CAHIGVoteState) {
                currentScene.voteCounter.updateCurrentPlayers((ply) => !!ply.voteTarget);
            }
        });

        s.on("voteresults", (tally: Record<string, number>) => {
            if (!currentGame) return;

            console.log("votes received", tally);

            // parse the votes
            for (const [id, count] of Object.entries(tally)) {
                const ply = currentGame.players.get(id);

                if (!ply) {
                    console.log(`votes received for unknown player ${id}`);
                    continue;
                }

                ply.votesReceived = count;
            }

            if (currentScene instanceof CAHIGVoteState) {
                currentScene.finish(new CAHIGVoteResultsState(currentScene.background.particles));
            }
        });

        s.on("advancevotes", ([id, duration]) => {
            if (!currentGame) return;

            console.log(`advancing votes (${id}) for ${duration}ms`);

            // just put the update in the bag bro
            if (currentScene instanceof CAHIGVoteResultsState) {
                currentScene.advance(id, duration);
            }
        });

        s.on("roundresults", (results: CAHRoundResults) => {
            if (!currentGame) return;

            console.log("got round results", results);

            for (const [id, score] of results) {
                const ply = currentGame.players.get(id);
                if (!ply) continue;

                ply.score += score;
            }

            if (currentScene instanceof CAHIGVoteResultsState) {
                currentScene.showResults(results);
                currentScene.playerList.reloadPlayers(); // needed to update the scores
            }
        });

        s.on("repeat", (newBlackCard) => {
            if (!currentGame) return;

            console.log(`returning to start with ${newBlackCard}`);

            for (const [_, ply] of currentGame.players) {
                // remove the played card, if it exists
                const index = ply.cardsWhite.indexOf(ply.chosenWhiteCard);
                if (index != -1) {
                    ply.cardsWhite.splice(index, 1);
                }

                // reset other shit
                ply.chosenWhiteCard = "";
                ply.voteTarget = "";
                ply.votesReceived = 0;
            }

            currentGame.currentBlackCard = newBlackCard;
            currentGame.state = CAHGameState.Play;

            if (currentScene instanceof CAHIGVoteResultsState) {
                currentScene.finish(new CAHIGPlayState(currentScene.background.particles));
            }
        });

        s.on("finalscore", () => {
            if (!currentGame) return;

            if (currentScene instanceof CAHIGVoteResultsState) {
                currentScene.finish(new CAHIGFinalScoreState(currentScene.background.particles));
            }
        });

        s.on("finalscore_advance", (step: number) => {
            if (!currentGame) return;

            if (currentScene instanceof CAHIGFinalScoreState) {
                switch (step) {
                    case 0:
                        currentScene.podium.showBronze();
                        break;
                    case 1:
                        currentScene.podium.showSilver();
                        break;
                    case 2:
                        currentScene.podium.showGold();
                        break;
                }
            }
        });

        s.on("end", () => {
            if (!currentGame) return;

            for (const [_, ply] of currentGame.players) {
                // reset all that stuff
                ply.chosenWhiteCard = "";
                ply.voteTarget = "";
                ply.votesReceived = 0;
                ply.score = 0;
                ply.cardsBlack = [];
                ply.cardsWhite = [];
            }

            currentGame.state = CAHGameState.WaitingForPlayers;

            if (currentScene instanceof CAHIGFinalScoreState) {
                currentScene.finish(new CAHIGLobbyState(currentScene.background.particles));
            }
        });
        //#endregion

        s.on("winblackcard", ([id, card]) => {
            if (!currentGame) return;

            const winner = currentGame.players.get(id);
            if (!winner) return;

            winner.cardsBlack.push(card);
        });

        s.on("reaction", ([id, reaction]) => {
            if (!currentGame) return;

            console.log(`${id} reacted with ${reaction} (${Reaction[reaction]})`);

            if (currentScene instanceof CAHInGameBaseScene) {
                currentScene.playerList.handleReaction(id, reaction);
            }
        });

        s.once("ack", () => {
            socket = s;
            resolve(socket);
        });
    });
}
