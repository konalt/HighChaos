import { d, font, h, w } from "../../engine/engine";

export async function draw() {
    d.rect(0, 0, w, h, "#111");

    d.text(w / 2, h / 2, "Connecting...", "white", font(96), "center");
}

export async function init() {}
