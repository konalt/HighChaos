import * as scene_menu from "./scenes/menu";
import * as c from "./engine";
import { loadFonts } from "./fonts";

loadFonts().then(() => {
    c.setScene(scene_menu);

    c.init();
});
