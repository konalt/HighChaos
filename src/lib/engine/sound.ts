import { log } from "./log";
import { sample } from "./utils";

const GROUP_SOUND_REGEX = /_\d+$/;

let audioContext: AudioContext;

//#region sound loading
const loadedSounds: Record<string, AudioBuffer[]> = {};

export async function loadSounds(id: string) {
    if (!audioContext) audioContext = new AudioContext();

    // GET manifest from server
    const manifest = (await fetch(`/sndmanifest/${id}`).then((r) => r.text())).split("\n") as string[];

    log("sound", `Loading ${manifest.length} sounds from manifest ${id}`);

    for (const sound of manifest) {
        // Handle group sound names: they must match a regex.
        if (sound.match(GROUP_SOUND_REGEX)) {
            const sndid = sound.split("_").slice(0, -1).join("_");

            // if we havent loaded any of these sounds yet, make a new array for them
            if (!loadedSounds[sndid]) loadedSounds[sndid] = [];

            // load the sound and store it
            const arrayBuffer = await (await fetch(`/assets/snd/${id}/${sound}.mp3`)).arrayBuffer();
            audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                log("sound", `Loaded sound for group ${sndid}: ${sound}`);
                loadedSounds[sndid].push(audioBuffer);
            });
        } else {
            // Normal sound without a group. Load and store it normally
            const arrayBuffer = await (await fetch(`/assets/snd/${id}/${sound}.mp3`)).arrayBuffer();
            audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                log("sound", `Loaded normal sound ${sound}`);
                loadedSounds[sound] = [audioBuffer];
            });
        }
    }

    log("sound", "All sounds loaded");
}
//#endregion

//#region volume
let gains: [number, GainNode][] = [];
let masterVolume = 1;

export function setMasterVolume(newVolume: number) {
    masterVolume = newVolume;

    // update all the gain nodes to the new volume
    for (const [originalVolume, node] of gains) {
        node.gain.value = originalVolume * newVolume;
    }
}
//#endregion

const sources: Record<string, AudioBufferSourceNode[]> = {};
export function playSound(sound: string, volume = 1, loop = false, forceIndex = -1) {
    if (!loadedSounds[sound]) {
        console.error(`Tried to play unknown sound ${sound}!`);
    }

    log("sound", `Playing sound ${sound}`);

    // Create gain node for volume adjustment
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume * masterVolume;
    gainNode.connect(audioContext.destination);
    gains.push([volume, gainNode]); // store it in the global cache to change the vol later

    // create the audio source
    const source = audioContext.createBufferSource();
    source.loop = loop;
    let index = Math.floor(Math.random() * loadedSounds[sound].length);
    if (forceIndex != -1) index = forceIndex;
    source.buffer = loadedSounds[sound][index]; // random one from the soundgroup
    source.connect(gainNode);

    if (!sources[sound]) sources[sound] = [];
    sources[sound].push(source);

    source.addEventListener("ended", () => {
        if (!source.loop) {
            gains = gains.filter((g) => g[1] !== gainNode);
        } else {
            // replace with a new buffer
            if (forceIndex != -1) {
                source.buffer = sample(loadedSounds[sound]); // random one from the soundgroup
            }
        }
    });

    source.start(0);

    return source;
}
