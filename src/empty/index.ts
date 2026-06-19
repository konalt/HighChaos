import * as c from "../lib/engine/engine";
import { loadFonts } from "../lib/engine/fonts";
import { ExampleScene } from "./scenes/example";

loadFonts().then(() => {
    c.setResolution(1);

    c.setScene(new ExampleScene(), true);

    c.init("empty");
});
