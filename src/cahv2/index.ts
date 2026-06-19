import { loadFonts } from "../lib/engine/fonts";
import * as c from "../lib/engine/engine";
import { CAHMenuBaseScene } from "./scenes/menubase";
import { CAHMainMenuScene } from "./scenes/mainmenu";

loadFonts().then(() => {
    c.setResolution(1);

    c.setScene(new CAHMainMenuScene());

    c.init("empty");
});
