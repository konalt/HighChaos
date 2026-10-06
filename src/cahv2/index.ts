import { HCFont, loadFonts, loadFontsAdvanced } from "../lib/engine/fonts";
import * as c from "../lib/engine/engine";
import { CAHMenuBaseScene } from "./scenes/menubase";
import { CAHMainMenuScene } from "./scenes/mainmenu";
import { loadSounds } from "../lib/engine/sound";
import { loadEmojis } from "./reactions";

declare global {
    interface Window {
        cardsWhite: string[];
        cardsBlack: string[];
    }
}

fetch("/fonts/montserrat.json")
    .then((r) => r.json())
    .then(async (montserratData) => {
        const montserrat = montserratData as HCFont;
        await loadFontsAdvanced([montserrat]);

        // load card data
        window.cardsWhite = ["Placeholder white card"];
        await fetch("/assets/data/cah_white.txt")
            .then((r) => r.text())
            .then((r) => {
                window.cardsWhite = r.split("\n").map((c) => c.replace(/\\n/g, "\n"));
            });

        window.cardsBlack = ["Placeholder black card. We all love the %%% here."];
        await fetch("/assets/data/cah_black.txt")
            .then((r) => r.text())
            .then((r) => {
                window.cardsBlack = r.split("\n").map((c) => c.replace(/\\n/g, "\n"));
            });

        await loadSounds("cahv2");
        await loadSounds("ui");

        await loadEmojis();

        c.setFont("'Montserrat', cursive");
        c.setResolution(1);

        c.setScene(new CAHMainMenuScene());

        c.init("empty");
    });
