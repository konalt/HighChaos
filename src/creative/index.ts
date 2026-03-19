import * as c from "../lib/engine/engine";
import { loadFonts } from "../lib/engine/fonts";
import { loadSettings } from "../lib/engine/options";

import init from "../wasm_gzip/wasm_gzip.js";
import { ConnectScene } from "./scenes/connect";

Promise.all([init(), loadFonts()]).then(() => {
    c.setFont("'Le Cristal de Lune', cursive");

    loadSettings();

    c.setResolution(1);

    c.setScene(new ConnectScene()).then(() => {
        c.init("creative");
    });
});
