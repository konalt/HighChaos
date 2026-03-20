import { deltaTime } from "../../lib/engine/engine";
import { socket } from "../game/game";
import { players, ply } from "../game/player";
import { gameSettings } from "../game/settings";
import { PACKET } from "./packets";

export type NetworkedSnapshot = {
    time: number;
    x: number;
    vx: number;
    y: number;
    vy: number;
};

export type ClientPlayerState = {
    id: string;
    snapshots: NetworkedSnapshot[];
    x: number;
    vx: number;
    y: number;
    vy: number;
};

export type ServerPlayerState = {
    id: string;
    x: number;
    vx: number;
    y: number;
    vy: number;
};

export type Input = {
    seq: number;
    dir: -1 | 0 | 1;
};

export let inputSeq = 0;
export let pendingInputs: Input[] = [];

export const INTERP_DELAY = 100; // ms

export function handleUpdatePacket(pktString: string) {
    const packet = JSON.parse(pktString);

    for (const p of packet.players) {
        if (!players.has(p.id)) {
            console.warn(`player not found ${p.id}`);
            continue;
        }

        const player = players.get(p.id);

        player.snapshots.push({
            time: packet.time,
            x: p.x,
            vx: p.vx,
            y: p.y,
            vy: p.vy,
        });

        if (player.snapshots.length > 10) {
            player.snapshots.shift();
        }

        if (p.id == socket.id) {
            reconcile(player, p.x, p.y);
        }
    }
}

export function reconcile(player: ClientPlayerState, serverX: number, serverY: number) {
    const errorX = serverX - player.x;
    const errorY = serverY - player.y;
    player.x += errorX * 0.1;
    player.y += errorY * 0.1;

    // optional: clear acknowledged inputs if you track seq from server
}

export function sendInput(dir: -1 | 0 | 1) {
    const input: Input = {
        seq: inputSeq++,
        dir,
    };

    pendingInputs.push(input);

    ply.vx = dir;
    ply.x += dir * gameSettings.playerSpeed * deltaTime;

    socket.emit(PACKET.SC_PLAYER_MOVE, (dir + 1).toString());
}
