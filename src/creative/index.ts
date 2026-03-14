import * as c from "../engine/engine";
import { loadFonts } from "../engine/fonts";
import { loadSettings } from "../engine/options";

import init from "../wasm_gzip/wasm_gzip.js";
import { ConnectScene } from "./scenes/connect";

Promise.all([init(), loadFonts()]).then(() => {
    c.setFont("'Futuristic Armour', sans-serif");

    loadSettings();

    c.setResolution(1);

    c.setScene(new ConnectScene(), false);

    c.init("creative");
});
