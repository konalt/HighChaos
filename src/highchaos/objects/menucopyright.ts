import { MenuFont } from "../constants";
import { ctx, d, font, getKeyDown, h, setFont, w } from "../../engine/engine";
import { sample } from "../../engine/utils";

const Copyright = [
    "Copyright",
    "Conkerright",
    "Quopyright",
    "Cockywhite",
    "Blockylight",
    "Cooker",
    "C symbol",
    "Jokerright",
];
const Symbol = ["©", "⑨"];
const Times = ["2025", "2 weeks ago", "Last Thursday"];
const Companies = [
    "Konalt",
    "Evil Konalt",
    "Bonalt",
    window.location.hostname,
    "Goblin Industries",
    "Homer Simpson Software",
    "Vessel 😈 Development 😱",
];

function generate() {
    return [sample(Copyright), sample(Symbol), sample(Times), "by", sample(Companies)].join(" ");
}
let text = generate();

export function draw() {
    if (getKeyDown("keyc")) {
        text = generate();
    }

    setFont(MenuFont);
    ctx.textBaseline = "bottom";
    d.text(w - 3, h - 3, text, "rgba(255, 255, 255, 0.84)", font(30), "right");
}
