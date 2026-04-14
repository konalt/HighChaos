import { deltaTime } from "../../lib/engine/engine";
import { socket } from "../game/game";
import { players, ply } from "../game/player";
import { gameSettings } from "../game/settings";
import { PacketString } from "../handlers";
import { decodeNumber } from "./network";
import { PACKET } from "./packets";

export type NetworkedSnapshot = {
    time: number;
    x: number;
    dx: number;
    y: number;
    dy: number;
    ladder: boolean;
};

export type ClientPlayerState = {
    id: string;
    snapshots: NetworkedSnapshot[];
    x: number;
    dx: number;
    y: number;
    dy: number;
    ladder: boolean;
    ready: boolean;
};

export type ServerPlayerState = {
    id: string;
    x: number;
    dx: number;
    y: number;
    dy: number;
    ladder: boolean;
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

    //const time = pktString.split(" ")[0];
    const playerUpdates = pktString.split(" ")[1].split(";");

    for (const upd of playerUpdates) {
        const [id, dataString] = upd.split(":");

        const player = players.get(id);
        if (!player) {
            console.warn(`player not found ${id}`);
            continue;
        }

        const data = dataString.split(",");

        const [x, dx, y, dy] = data.slice(0, 4).map((n) => decodeNumber(n));

        const snapshot: NetworkedSnapshot = {
            time: performance.now(),
            x: x,
            dx: dx,
            y: y,
            dy: dy,
            ladder: data[5] == "1",
        };

        player.snapshots.push(snapshot);

        player.ready = data[4] == "1";

        if (player.snapshots.length > 30) {
            player.snapshots.shift();
        }

        reconcile(player, x, y);
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

    ply.dx = dir;
    ply.x += dir * gameSettings.playerSpeed * deltaTime;

    socket.emit(PACKET.SC_PLAYER_MOVE, (dir + 1).toString());
}
