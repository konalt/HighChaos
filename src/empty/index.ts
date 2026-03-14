import * as c from "../engine/engine";
import { loadFonts } from "../engine/fonts";
import { loadSettings } from "../engine/options";
import { ExampleScene } from "./scenes/example";

loadFonts().then(() => {
    //loadSettings();
    c.setResolution(1);

    c.setScene(new ExampleScene(), true);

    c.init("empty");
});
