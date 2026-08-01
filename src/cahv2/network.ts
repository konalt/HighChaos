import * as sio from "socket.io-client";
import { currentScene, setScene, startTimer } from "../lib/engine/engine";
import { CAHMainMenuScene } from "./scenes/mainmenu";
import { deserializePlayer } from "./types";
import { currentGame } from "./game";
import { CAHInGameBaseScene } from "./scenes/ingamebase";

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

        s.once("ack", () => {
            socket = s;
            resolve(socket);
        });
    });
}
