export let pingTable: Record<string, number> = {};

export function setPingTable(t: Record<string, number>) {
    pingTable = t;
}
