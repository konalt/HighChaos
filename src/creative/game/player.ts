import { lerp } from "../../lib/engine/utils";
import { socket } from "./game";
import { INTERP_DELAY, ClientPlayerState, ServerPlayerState } from "../net/interp";
import { gameSettings } from "./settings";
import { deltaTime } from "../../lib/engine/engine";

export let players = new Map<string, ClientPlayerState>();

export let ply: ClientPlayerState;

export function updatePlayers() {
    const now = performance.now();
    const renderTime = now - INTERP_DELAY;

    for (const player of players.values()) {
        if (player.id == socket.id) {
            ply.x += ply.vx * gameSettings.playerSpeed * deltaTime;
            continue;
        }

        const snapshots = player.snapshots;

        if (snapshots.length < 2) continue;

        // find two snapshots around renderTime
        let i = 0;
        while (i < snapshots.length - 1 && snapshots[i + 1].time < renderTime) {
            i++;
        }

        const prev = snapshots[i];
        const next = snapshots[i + 1];

        if (!next) continue;

        const t = (renderTime - prev.time) / (next.time - prev.time);

        // smooth interpolation
        player.x = lerp(prev.x, next.x, t);
    }
}

export function addPlayer(_ply: ServerPlayerState) {
    let cp: ClientPlayerState = {
        ..._ply,
        snapshots: [],
    };
    if (_ply.id == socket.id) ply = cp;
    players.set(_ply.id, cp);
}
