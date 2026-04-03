import { currentScene, deltaTime, globalTimer, setTargetFramerate } from "../lib/engine/engine";
import { serverDeltaTime, setSDT, socket } from "./game/game";
import { BlockStruct, removeBlock, setBlock, setBlocks } from "./game/blocks";
import { setMessages } from "./game/chat";
import { setPingTable } from "./game/ping";
import { gameSettings, setSettings } from "./game/settings";
import { AckPacket, PACKET } from "./net/packets";
import { InGameScene } from "./scenes/ingame";
import { ClientPlayerState } from "./net/interp";
import { addPlayer } from "./game/player";

export function ackHandler(packetStr: string) {
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

export function playerJoinHandler(data: string) {
    let p = JSON.parse(data) as ClientPlayerState;
    addPlayer(p);
}

/* export function playerLeaveHandler(id: string) {
    console.log("leave: " + id);

    if (id == socket.id) {
        console.error("Error?????? Tried to leave self????");
        return;
    }
    players.delete(id);
    if (currentScene instanceof InGameScene) {
        currentScene.removePlayer(id);
    }
} */

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
    console.debug(
        `new delta time: ${n}\nold: ${serverDeltaTime}\ndiff:${serverDeltaTime - parseFloat(n)}\nclient: ${deltaTime}`,
    );

    //setSDT(parseFloat(n));
}
