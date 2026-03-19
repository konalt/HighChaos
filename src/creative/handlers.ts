import { currentScene, deltaTime, globalTimer, setTargetFramerate } from "../lib/engine/engine";
import {
    addPlayer,
    BlockStruct,
    gameSettings,
    pingTable,
    Player,
    players,
    removeBlock,
    setBlock,
    setBlocks,
    setMessages,
    setPingTable,
    setSDT,
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
    setMessages(packet.messages);
    setPingTable(packet.pingTable);

    setTargetFramerate(1000 / gameSettings.updateRate);

    socket.emit(PACKET.CS_PLAYER_JOIN);
}

const PLAYER_DATA_ALWAYS_UPDATE = ["dx", "dy"];
const PLAYER_DATA_UPDATE_GROUP: Record<string, string[]> = {
    x: ["y"],
    y: ["x"],
};

let lastDesync = 0;

export let lastPlayerUpdate: Record<string, number> = {};
export function playerUpdateHandler(fullPacket: string) {
    for (const pkt of fullPacket.split("|").map((e) => e.split(" "))) {
        let id = pkt[0];
        let ply = players.get(id);
        if (!ply) continue;
        let ent = pkt.slice(1).map((e) => e.split("="));
        let _pkt = Object.fromEntries(ent);
        for (const [k, v] of ent) {
            if (k.startsWith("old_")) continue; // used for interpolation, handled automatically by client. ignore
            let s: string | number = v;
            if (v.startsWith("@@")) {
                s = parseInt(v.substring(2), 36);
                let set = (setold = true) => {
                    let g = PLAYER_DATA_UPDATE_GROUP[k];
                    if (g) {
                        for (const d of g) {
                            if (_pkt[d]) {
                                if (Object.hasOwn(ply, "old_" + d) && setold)
                                    ply["old_" + d] = parseInt(ply[d].toString());
                                ply[d] = parseInt(_pkt[d].substring(2), 36);
                            }
                        }
                    }
                    if (Object.hasOwn(ply, "old_" + k) && setold) ply["old_" + k] = parseInt(ply[k].toString());
                    ply[k] = s;
                };
                if ((k == "x" || k == "y") && currentScene instanceof InGameScene) {
                    ply["sv_" + k] = s;
                }
                if (PLAYER_DATA_ALWAYS_UPDATE.includes(k)) {
                    set();
                }
                let d1 = ply[k] - s;
                let d2 = Math.abs(d1);
                if (d2 > gameSettings.maxClientDesync) {
                    console.warn(
                        `Client desync too large, snapping!\n${k}: ${ply[k]} => ${s} (${d1})\nlast desync was ${performance.now() - lastDesync}ms`,
                    );
                    lastDesync = performance.now();
                    set();
                } else {
                    console.debug(`${k}: ${ply[k]} => ${s} (${d1})`);
                }
            } else {
                ply[k] = s;
            }
        }
        lastPlayerUpdate[id] = globalTimer;
    }
}

export function playerMoveHandler(data: string) {
    let [id, dx] = data.split(" ");
    if (id == socket.id) return;
    players.get(id).dx = parseInt(dx) - 1;
}

export function playerJumpHandler(id: string) {
    //if (id == socket.id) return;
    players.get(id).dy = -gameSettings.jumpVelocity;
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

export function chatHandler(d: string) {
    let msg = JSON.parse(d);

    if (currentScene instanceof InGameScene) {
        currentScene.chat.messages.push(msg);
    }
}

export function chatClearHandler() {
    console.log("clearing");

    setMessages([]);

    if (currentScene instanceof InGameScene) {
        currentScene.chat.messages = [];
    }
}

export function blockUpdateHandler(data: string) {
    let upd = JSON.parse(data);
    let x = upd[0];
    let y = upd[1];
    let type = upd[2];

    let blk = new BlockStruct();
    blk.gx = x;
    blk.gy = y;
    blk.type = type;

    setBlock(blk);
}

export function blockRemoveHandler(cString: string) {
    let [x, y] = cString.split(",").map((n) => parseInt(n));

    removeBlock(x, y);
}

export function deltaTimeHandler(n: string) {
    setSDT(parseFloat(n));
}
