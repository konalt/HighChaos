import { compressGzip, decompressGzip } from "../../wasm_gzip/wasm_gzip.js";
import { textDecoder, textEncoder } from "../game.js";

export function pkt(evt: string, data?: any) {
    if (data) {
        return `${evt}\uE001${data}`;
    }
    return evt;
}

export class GameSocket {
    private socket: WebSocket;
    private events: Map<string, (data?: any) => void>;
    id: string;

    constructor() {
        this.events = new Map();

        const socket = new WebSocket("wss://konalt.net:32890");

        socket.onopen = (e) => {
            console.log("Connection opened");
        };

        socket.onmessage = async (e) => {
            if (typeof e.data == "string" && e.data.startsWith("__ID__")) {
                let id = e.data.substring(6);
                this.id = id;
                console.log(`id: ${id}`);
                socket.send("__READY__");
                return;
            }
            try {
                let intarr: Uint8Array = new Uint8Array(await e.data.arrayBuffer());
                let decomp = textDecoder.decode(decompressGzip(intarr)).split("\uE001");
                let evt = decomp[0];
                let cb = this.events.get(evt);
                if (cb) {
                    let data = decomp[1];
                    if (data) {
                        cb(data);
                    } else {
                        cb();
                    }
                }
            } catch (e) {
                console.log("Error decoding packet:", e);
            }
        };

        this.socket = socket;
    }

    on(evt: string, cb: (data?: string) => void) {
        this.events.set(evt, cb);
    }

    emit(evt: string | number, data?: string) {
        if (typeof evt == "number") evt = String.fromCharCode(evt);
        let _d = data;
        try {
            _d = JSON.stringify(data);
        } catch (_) {}
        if (data) {
            this._send(pkt(evt, _d));
        } else {
            this._send(pkt(evt));
        }
    }

    private _send(packet: string) {
        let zipped = compressGzip(textEncoder.encode(packet));
        this.socket.send(zipped);
    }
}
