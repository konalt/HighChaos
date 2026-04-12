import { lerp, TwoNums } from "../../lib/engine/utils";
import { socket } from "./game";
import { INTERP_DELAY, ClientPlayerState, ServerPlayerState, reconcile } from "../net/interp";
import { gameSettings } from "./settings";
import { deltaTime } from "../../lib/engine/engine";
import { initExtraPlayerInfo } from "./extraplayerinfo";
import { world } from "./world";
import { getBlockData } from "./blocks";

export let players = new Map<string, ClientPlayerState>();

export let ply: ClientPlayerState;

export function playerCollisionCheck(ply: ClientPlayerState, dir: "x" | "y", prev: TwoNums) {
    let collided = false;
    let check = world.playerBlockCheck(ply, prev);
    if (check) {
        let [block, rect] = check;
        collided = true;
    }
    if (!collided) return false;
    if (dir == "x") {
        ply.x = prev[0];
    } else {
        ply.y = prev[1];
        if (!ply.ld) ply.vy = 0;
    }
    return true;
}

function updatePlayer(ply: ClientPlayerState) {
    for (let i = 0; i < gameSettings.physSteps; i++) {
        let originalPosition = structuredClone([ply.x, ply.y] as TwoNums);
        ply.x += (ply.vx * deltaTime * gameSettings.playerSpeed) / gameSettings.physSteps;
        playerCollisionCheck(ply, "x", originalPosition);
        if (ply.ld) {
            ply.ld = world.playerLadderCheck(ply);
        }
        if (ply.ld) {
            ply.y += (ply.vy * deltaTime * gameSettings.ladderSpeed) / gameSettings.physSteps;
        } else {
            ply.vy += (gameSettings.gravity * deltaTime) / gameSettings.physSteps;
            ply.y += (ply.vy * deltaTime) / gameSettings.physSteps;
        }
        playerCollisionCheck(ply, "y", originalPosition);
    }
}

export function updatePlayers() {
    const now = performance.now();
    const renderTime = now - INTERP_DELAY;

    for (const player of players.values()) {
        if (!player.ready) continue;
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
        player.ld = next.ld;
        player.y = lerp(t, prev.y, next.y);
        player.vy = next.vy;
    }
}

export function addPlayer(_ply: ServerPlayerState) {
    if (players.get(_ply.id)) return;

    let cp: ClientPlayerState = {
        ..._ply,
        snapshots: [],
    };
    console.log(`adding`, cp);

    if (_ply.id == socket.id) ply = cp;
    players.set(_ply.id, cp);
    initExtraPlayerInfo(_ply);
}
