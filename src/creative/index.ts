import * as c from "../lib/engine/engine";
import { loadFonts } from "../lib/engine/fonts";
import { loadSettings } from "../lib/engine/options";

import init from "../wasm_gzip/wasm_gzip.js";
import { ConnectScene } from "./scenes/connect";

let fonts = ["PixelOperator/PixelOperator", "PixelOperator/PixelOperator-Bold"];

Promise.all([init(), loadFonts(fonts)]).then(() => {
    c.setFont("sans-serif");
    c.setTargetFramerate(1000);

    loadSettings();

    c.setResolution(1);

    c.setScene(new ConnectScene()).then(() => {
        c.init("creative");
    });
});
