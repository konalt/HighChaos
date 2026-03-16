import { currentScene, globalTimer, setTargetFramerate } from "../lib/engine/engine";
import {
    addPlayer,
    gameSettings,
    pingTable,
    Player,
    players,
    setBlocks,
    setPingTable,
    setSettings,
    socket,
} from "./game";
import { AckPacket, PACKET } from "./net/packets";
import { InGameScene } from "./scenes/ingame";

export function ackHandler(packetStr: string) {
    let packet: AckPacket = JSON.parse(packetStr);

    players.clear();
    for (const [i, p] of packet.players) {
        addPlayer(p);
    }

    setBlocks(packet.blocks);
    setSettings(packet.settings);
    setPingTable(packet.pingTable);

    setTargetFramerate(1000 / gameSettings.updateRate);

    socket.emit(PACKET.CS_PLAYER_JOIN);
}

export let lastPlayerUpdate: Record<string, number> = {};
export function playerUpdateHandler(fullPacket: string) {
    for (const pkt of fullPacket.split("|").map((e) => e.split(" "))) {
        let id = pkt[0];
        let ply = players.get(id);
        if (!ply) continue;
        for (const [k, v] of pkt.slice(1).map((e) => e.split("="))) {
            let s: string | number = v;
            if (v.startsWith("@@")) {
                s = parseInt(v.substring(2), 36) / 100;
                if (Object.hasOwn(ply, "old_" + k)) {
                    let d = Math.abs(ply[k] - s);
                    if (id == socket.id) {
                        if (d > 20) {
                            console.warn(`Client desync too large (${d}) - snapping!`);
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
    if (p.id == socket.id) return;
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

export function pingSendHandler(t: string) {
    socket.emit(PACKET.CS_PING_RESP, t);
}

export function pingTableHandler(d: string) {
    setPingTable(JSON.parse(d));
}
