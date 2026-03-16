import { globalTimer } from "../lib/engine/engine";
import { players, socket } from "./game";

export let lastPlayerUpdatePacket = 0;
export function playerUpdateHandler(fullPacket: string) {
    for (const pkt of fullPacket.split("|").map((e) => e.split(" "))) {
        let id = pkt[0];
        let ply = players.get(id);
        for (const [k, v] of pkt.slice(1).map((e) => e.split("="))) {
            let s: string | number = v;
            if (v.startsWith("@@")) {
                s = parseInt(v.substring(2), 36) / 100;
                if (Object.hasOwn(ply, "old_" + k)) {
                    let d = ply[k] - s;
                    if (id == socket.id) {
                        if (d > 10) {
                            console.log("Client desync too large - snapping!");
                            ply["old_" + k] = parseInt(ply[k].toString());
                            ply[k] = s;
                        }
                    } else {
                        ply["old_" + k] = parseInt(ply[k].toString());
                        ply[k] = s;
                    }
                }
            } else {
                ply[k] = s;
            }
        }
    }
    lastPlayerUpdatePacket = globalTimer;
}
