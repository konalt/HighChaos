import { lerp, TwoNums } from "../../lib/engine/utils";
import { socket } from "./game";
import { INTERP_DELAY, ClientPlayerState, ServerPlayerState, reconcile } from "../net/interp";
import { gameSettings } from "./settings";
import { deltaTime } from "../../lib/engine/engine";
import { playerCollisionCheck } from "../collision";

export let players = new Map<string, ClientPlayerState>();

export let ply: ClientPlayerState;

function updatePlayer(ply: ClientPlayerState) {
    for (let i = 0; i < gameSettings.physSteps; i++) {
        let originalPosition = structuredClone([ply.x, ply.y] as TwoNums);
        ply.x += (ply.vx * deltaTime * gameSettings.playerSpeed) / gameSettings.physSteps;
        playerCollisionCheck(ply, "x", originalPosition);
        ply.y += (ply.vy * deltaTime) / gameSettings.physSteps;
    }
}

export function updatePlayers() {
    const now = performance.now();
    const renderTime = now - INTERP_DELAY;

    for (const player of players.values()) {
        updatePlayer(player);
        if (player.id == socket.id) {
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
        player.x = lerp(t, prev.x, next.x);
        player.vx = next.vx;
    }
}

export function addPlayer(_ply: ServerPlayerState) {
    let cp: ClientPlayerState = {
        ..._ply,
        snapshots: [],
    };
    console.log(`adding`, cp);

    if (_ply.id == socket.id) ply = cp;
    players.set(_ply.id, cp);
}
