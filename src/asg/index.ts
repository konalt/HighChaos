import { init, setResolution, setScene } from "../lib/engine/engine";
import { loadFonts } from "../lib/engine/fonts";
import { ASGInGameScene } from "./scenes/ingame";

loadFonts().then(() => {
    setResolution(1);

    setScene(new ASGInGameScene());

    init("asg");
});
