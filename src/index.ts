import * as scene_menu from "./scenes/menu";
import * as c from "./engine";
import { loadFonts } from "./fonts";
import { loadSettings } from "./options";

loadFonts().then(() => {
    loadSettings();

    c.setScene(scene_menu, true);

    c.init();
});
