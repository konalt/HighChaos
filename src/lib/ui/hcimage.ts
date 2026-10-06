import { d, loadImage } from "../engine/engine";
import { GameObject } from "../engine/object";
import { Anchor } from "../engine/utils";

export const NULLTEXTURE_DATA =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAALElEQVQYV2P8z/D/PwMQMAIhCAD5YBrGZySoAKwJi06ESYQUELSCoAKK3QAAUtcn+TTvDwYAAAAASUVORK5CYII=";
export let NULLTEXTURE: HTMLImageElement;

let img = new Image();
img.onload = () => {
    NULLTEXTURE = img;
};
img.src = NULLTEXTURE_DATA;

export class HCImage extends GameObject {
    src: string;
    scale = 1;
    anchor: Anchor = "tl";
    image: HTMLImageElement;

    constructor() {
        super();
        this.src = NULLTEXTURE_DATA;

        this.image = NULLTEXTURE;
    }

    draw() {
        d.quickImage(this.image, this.x, this.y, this.scale, this.anchor);
    }

    async load() {
        this.image = await loadImage(this.src);
    }
}
