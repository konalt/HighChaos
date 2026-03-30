import * as c from "../lib/engine/engine";
import { loadFonts } from "../lib/engine/fonts";
import { loadSettings } from "../lib/engine/options";
import { MainScene } from "./scenes/main";

loadFonts().then(() => {
    c.setResolution(1);
    c.setTargetFramerate(75);

    c.setScene(new MainScene());

    c.init("traffic_roundabout");
});
