import { loadFonts } from "../lib/engine/fonts";
import * as c from "../lib/engine/engine";
import { CAHMenuBaseScene } from "./scenes/menubase";

loadFonts().then(() => {
    c.setResolution(1);

    c.setScene(new CAHMenuBaseScene(), true);

    c.init("empty");
});
