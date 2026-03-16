import { currentScene, globalTimer } from "../lib/engine/engine";
import { addPlayer, Player, players, ply, setPly, socket } from "./game";
import { InGameScene } from "./scenes/ingame";

export let lastPlayerUpdate: Record<string, number> = {};
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
        lastPlayerUpdate[id] = globalTimer;
    }
}

export function playerJoinHandler(data: string) {
    let p = JSON.parse(data) as Player;
    addPlayer(p);
}

export function playerLeaveHandler(id: string) {
    console.log("leave: " + id);

    if (id == socket.id) {
        console.error("Error?????? Tried to leave self????");
        return;
    }
    players.delete(id);
    if (currentScene instanceof InGameScene) {
        currentScene.removePlayer(id);
    }
}
