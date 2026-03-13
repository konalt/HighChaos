import * as scene_example from "./scenes/example";
import * as c from "../engine/engine";
import { loadFonts } from "../engine/fonts";
import { loadSettings } from "../engine/options";

loadFonts().then(() => {
    loadSettings();

    c.setScene(scene_example, true);

    c.init("santa");
});
