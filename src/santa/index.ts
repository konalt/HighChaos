import * as c from "../lib/engine/engine";
import { loadFonts } from "../lib/engine/fonts";
import { loadSettings } from "../lib/engine/options";
import { MenuScene } from "./scenes/menu";

loadFonts().then(() => {
    //loadSettings();

    c.setResolution(1);

    c.setScene(new MenuScene(), true);

    c.init("santa");
});
