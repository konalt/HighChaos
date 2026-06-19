import * as c from "../lib/engine/engine";
import { loadFonts } from "../lib/engine/fonts";
import { loadSettings } from "../lib/engine/options";
import { MainScene } from "./scenes/main";

loadFonts().then(() => {
    //loadSettings();
    c.setResolution(1);

    c.setScene(new MainScene(), false);

    c.init("bigtactoe");
});
