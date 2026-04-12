import { currentScene, deltaTime, globalTimer, setTargetFramerate } from "../lib/engine/engine";
import { serverDeltaTime, setSDT, socket } from "./game/game";
import { BlockStruct } from "./game/blocks";
import { setMessages } from "./game/chat";
import { setPingTable } from "./game/ping";
import { gameSettings, setSettings } from "./game/settings";
import { AckPacket, PACKET } from "./net/packets";
import { InGameScene } from "./scenes/ingame";
import { ClientPlayerState } from "./net/interp";
import { addPlayer, players } from "./game/player";
import { extraPlayerInfo } from "./game/extraplayerinfo";

// typescript started complaining so i have to add this now :/
export type PacketString = string | undefined;

export function ackHandler(packetStr: PacketString) {
    if (!packetStr) return;

    let packet: AckPacket = JSON.parse(packetStr);

    for (const p of packet.players) {
        addPlayer(p);
    }

    setSettings(packet.settings);
    setMessages(packet.messages);
    setPingTable(packet.pingTable);

    for (const [id, name] of packet.names) {
        extraPlayerInfo.names.set(id, name);
    }
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

export function playerLadderHandler(data: PacketString) {
    if (!data) return;

    const [id, dystr] = data.split(" ");
    const dy = parseInt(dystr) - 1;

    const player = players.get(id);
    if (!player) return;

    player.vy = dy;
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
