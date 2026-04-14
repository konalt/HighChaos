import { compressGzip, decompressGzip } from "../../wasm_gzip/wasm_gzip.js";
import { textDecoder, textEncoder } from "../game/game.js";

export function pkt(evt: string, data?: any) {
    if (data) {
        return `${evt}\uE001${data}`;
    }
    return evt;
}

export class GameSocket {
    private socket: WebSocket;
    private events: Map<string, (data?: string) => void>;
    id: string | undefined;

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
                    //console.log(PACKET[evt.charCodeAt(0)]);
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

    on(evt: string | number, cb: (data?: string) => void) {
        if (typeof evt == "number") evt = String.fromCharCode(evt);
        this.events.set(evt, cb);
    }

    emit(evt: string | number, data?: string) {
        if (typeof evt == "number") evt = String.fromCharCode(evt);
        if (data) {
            let _d = data;
            // janky ass way: fix if it breaks
            if (data.toString().startsWith("[object")) {
                _d = JSON.stringify(data);
            }
            this._send(pkt(evt, _d));
        } else {
            this._send(pkt(evt));
        }
    }

    private _send(packet: string) {
        let zipped = compressGzip(textEncoder.encode(packet));
        // nyaaaa :3
        // @ts-expect-error
        this.socket.send(zipped);
    }
}

export function encodeNumber(n: number, precision = 5) {
    return `${precision.toString(36)}\uF800${Math.floor(n * precision).toString(36)}`;
}

export function decodeNumber(encoded: string) {
    const [precStr, numberStr] = encoded.split("\uF800");
    return parseInt(numberStr, 36) / parseInt(precStr, 36);
}
