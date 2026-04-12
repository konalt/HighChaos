import { deltaTime } from "../../lib/engine/engine";
import { socket } from "../game/game";
import { players, ply } from "../game/player";
import { gameSettings } from "../game/settings";
import { PacketString } from "../handlers";
import { PACKET } from "./packets";

export type NetworkedSnapshot = {
    time: number;
    x: number;
    vx: number;
    y: number;
    vy: number;
    ld: boolean;
};

export type ClientPlayerState = {
    id: string;
    snapshots: NetworkedSnapshot[];
    x: number;
    vx: number;
    y: number;
    vy: number;
    ld: boolean;
    ready: boolean;
};

export type ServerPlayerState = {
    id: string;
    x: number;
    vx: number;
    y: number;
    vy: number;
    ld: boolean;
    ready: boolean;
};

export type Input = {
    seq: number;
    dir: -1 | 0 | 1;
};

export let inputSeq = 0;
export let pendingInputs: Input[] = [];

export const INTERP_DELAY = 120; // ms
export const INTERP_ERROR_CORRECT = 0.1;

export function handleUpdatePacket(pktString: PacketString) {
    if (!pktString) return;

    const packet = JSON.parse(pktString);

    for (const p of packet.players) {
        if (!players.has(p.id)) {
            console.warn(`player not found ${p.id}`);
            continue;
        }

        const player = players.get(p.id);
        if (!player) continue;

        player.snapshots.push({
            time: performance.now(),
            x: p.x,
            vx: p.vx,
            y: p.y,
            vy: p.vy,
            ld: p.ld,
        });

        //player.ld = p.ld;
        player.ready = p.ready;

        if (player.snapshots.length > 30) {
            player.snapshots.shift();
        }

        //if (p.id == socket.id) {
        reconcile(player, p.x, p.y);
        //}
    }
}

export function reconcile(player: ClientPlayerState, serverX: number, serverY: number) {
    const errorX = serverX - player.x;
    const errorY = serverY - player.y;
    player.x += errorX * INTERP_ERROR_CORRECT;
    player.y += errorY * INTERP_ERROR_CORRECT;
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
