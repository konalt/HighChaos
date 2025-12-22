import * as scene_game from "./scenes/game";
import * as c from "../engine/engine";
import { loadFonts } from "../engine/fonts";
import { loadSettings } from "../engine/options";

loadFonts().then(() => {
    loadSettings();

    c.setScene(scene_game, true);

    c.init("santa");
});
