import { PacketString } from "../handlers";
import { ServerPlayerState } from "../net/interp";

export interface ExtraPlayerInfo {
    names: Map<string, string>;
}

export let extraPlayerInfo: ExtraPlayerInfo = {
    names: new Map(),
};

export function initExtraPlayerInfo(ply: ServerPlayerState) {
    let id = ply.id;
    extraPlayerInfo.names.set(id, `ClientPlayer ${ply.id}`);
}

export function handleNameUpdate(data: PacketString) {
    if (!data) return;

    let [id, name] = JSON.parse(data);

    extraPlayerInfo.names.set(id, name);
}
