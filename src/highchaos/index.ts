import * as scene_menu from "./scenes/menu";
import * as c from "../lib/engine/engine";
import { loadFonts } from "../lib/engine/fonts";
import { loadSettings } from "../lib/engine/options";

loadFonts().then(() => {
    loadSettings();

    //c.setScene(scene_menu, true);

    c.init("highchaos");
});
