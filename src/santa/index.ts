import * as scene_menu from "./scenes/menu";
import * as c from "../engine/engine";
import { loadFonts } from "../engine/fonts";
import { loadSettings } from "../engine/options";

loadFonts().then(() => {
    loadSettings();

    c.setScene(scene_menu, true);

    c.init("santa");
});
