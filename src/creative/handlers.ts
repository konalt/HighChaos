import { currentScene, deltaTime, globalTimer, setTargetFramerate } from "../lib/engine/engine";
import { serverDeltaTime, setSDT, socket } from "./game/game";
import { BlockStruct, removeBlock, setBlock, setBlocks } from "./game/blocks";
import { setMessages } from "./game/chat";
import { setPingTable } from "./game/ping";
import { gameSettings, setSettings } from "./game/settings";
import { AckPacket, PACKET } from "./net/packets";
import { InGameScene } from "./scenes/ingame";
import { ClientPlayerState } from "./net/interp";
import { addPlayer, players } from "./game/player";

// typescript started complaining so i have to add this now :/
export type PacketString = string | undefined;

export function ackHandler(packetStr: PacketString) {
    if (!packetStr) return;

    let packet: AckPacket = JSON.parse(packetStr);

    for (const p of packet.players) {
        addPlayer(p);
    }

    setBlocks(packet.blocks);
    setSettings(packet.settings);
    setMessages(packet.messages);
    setPingTable(packet.pingTable);

    socket.emit(PACKET.CS_PLAYER_JOIN);
}

export function playerJoinHandler(data: PacketString) {
    if (!data) return;

    let p = JSON.parse(data) as ClientPlayerState;
    addPlayer(p);
}

export function playerJumpHandler(data: PacketString) {
    if (!data) return;

    let player = players.get(data);
    if (!player) return;

    player.vy = -gameSettings.jumpVelocity;
}

export function playerLeaveHandler(id: PacketString) {
    if (!id) return;

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

export function pingSendHandler(t: PacketString) {
    socket.emit(PACKET.CS_PING_RESP, t);
}

export function pingTableHandler(d: PacketString) {
    if (!d) return;

    setPingTable(JSON.parse(d));
}

export function chatHandler(d: PacketString) {
    if (!d) return;

    let msg = JSON.parse(d);

    if (currentScene instanceof InGameScene) {
        currentScene.chat.messages.push(msg);
    }
}

export function chatClearHandler() {
    setMessages([]);

    if (currentScene instanceof InGameScene) {
        currentScene.chat.messages = [];
    }
}

export function blockUpdateHandler(data: PacketString) {
    if (!data) return;

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

export function blockRemoveHandler(cString: PacketString) {
    if (!cString) return;
    let [x, y] = cString.split(",").map((n) => parseInt(n));

    removeBlock(x, y);
}

export function deltaTimeHandler(n: PacketString) {
    /* console.debug(
        `new delta time: ${n}\nold: ${serverDeltaTime}\ndiff:${serverDeltaTime - parseFloat(n)}\nclient: ${deltaTime}`,
    ); */
    //setSDT(parseFloat(n));
}
