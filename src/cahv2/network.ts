import * as sio from "socket.io-client";
import { setScene } from "../lib/engine/engine";
import { CAHMainMenuScene } from "./scenes/mainmenu";

export let socket: sio.Socket | null = null;

let isReloading = false;

export function initialize() {
    window.addEventListener("beforeunload", () => {
        isReloading = true;
    });

    return new Promise<sio.Socket>((resolve, reject) => {
        if (socket && socket.connected) return reject("Socket already connected :(");

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

        s.once("ack", () => {
            socket = s;
            resolve(socket);
        });
    });
}
