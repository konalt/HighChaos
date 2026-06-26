import * as sio from "socket.io-client";

export let socket: sio.Socket | null = null;

export function initialize() {
    return new Promise<sio.Socket>((resolve, reject) => {
        if (socket && socket.connected) return reject("Socket already connected :(");

        const m = new sio.Manager("https://konalt.net:58996");
        const s = m.socket("/");

        s.on("connect_error", (e) => {
            reject(e);
        });

        s.once("ack", () => {
            socket = s;
            resolve(socket);
        });
    });
}
