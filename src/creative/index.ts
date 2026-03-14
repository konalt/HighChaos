import * as scene_menu from "./scenes/menu";
import * as scene_connect from "./scenes/connect";
import * as c from "../engine/engine";
import { loadFonts } from "../engine/fonts";
import { loadSettings } from "../engine/options";

loadFonts().then(() => {
    c.setFont("'Futuristic Armour', sans-serif");

    loadSettings();

    c.setScene(scene_connect, false);

    c.init("creative");
});
