import { loadImage } from "../lib/engine/engine";
import { NULLTEXTURE } from "../lib/ui/hcimage";

export enum Reaction {
    Joy,
    MiddleFinger,
    Neutral,
    Sob,
    Teto,
    ThumbsDown,
    ThumbsUp,
    XD,
}

export const REACTION_IMAGES: Record<Reaction, HTMLImageElement> = {
    [Reaction.Joy]: NULLTEXTURE,
    [Reaction.MiddleFinger]: NULLTEXTURE,
    [Reaction.Neutral]: NULLTEXTURE,
    [Reaction.Sob]: NULLTEXTURE,
    [Reaction.Teto]: NULLTEXTURE,
    [Reaction.ThumbsDown]: NULLTEXTURE,
    [Reaction.ThumbsUp]: NULLTEXTURE,
    [Reaction.XD]: NULLTEXTURE,
};

export async function loadEmojis() {
    for (const reaction in REACTION_IMAGES) {
        // get the filename
        const val = parseInt(reaction) as Reaction;
        const id = Reaction[val].toLowerCase();

        REACTION_IMAGES[val] = await loadImage(`cahv2/emoji/${id}.png`);
    }
}
