import * as cutscene_intro from "./cutscenes/cutscene_intro";
import { w, h } from "./engine";
import * as c from "./engine";
import menu from "./menu";

cutscene_intro.init();
c.setDrawFunction(cutscene_intro.draw);

c.init();
