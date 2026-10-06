import { createOffscreenCanvas } from "../lib/engine/utils";
import { NULLTEXTURE_DATA } from "../lib/ui/hcimage";
import { socket } from "./network";
import { bitmapToDataURL, generateEmptyAvatar, IDBName } from "./utils";

export let currentUsername = loadUsername();

export function loadUsername() {
    const u = localStorage.getItem("cahv2_username");
    if (u) return u;
    const u2 = "Guest #" + Math.floor(Math.random() * 1e4);
    localStorage.setItem("cahv2_username", u2);
    return u2;
}

export function setUsername(n: string) {
    currentUsername = n;
    localStorage.setItem("cahv2_username", n);

    if (socket && socket.connected) {
        socket.emit("username", n);
    }
}

export let currentAvatar: ImageBitmap = generateEmptyAvatar();
export let currentAvatarString = NULLTEXTURE_DATA;

loadAvatar().then(async (a) => {
    currentAvatar = a;
    currentAvatarString = await bitmapToDataURL(a);
});

export async function setAvatar(a: ImageBitmap) {
    currentAvatar = a;
    currentAvatarString = await bitmapToDataURL(a);
    await saveAvatar(a);
    if (socket && socket.connected) {
        socket.emit("avatar", a);
    }
}

async function saveAvatar(avatar: ImageBitmap) {
    const canvas = new OffscreenCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(":3");
    ctx.drawImage(avatar, 0, 0);
    const blob = await canvas.convertToBlob({ type: "image/png" });

    const request = indexedDB.open(IDBName, 4);

    request.onupgradeneeded = () => {
        console.log("creating the object store");
        request.result.createObjectStore("images");
    };

    request.onerror = (e) => {
        console.log("Error creating/accessing");
        console.error(e);
    };

    request.onsuccess = () => {
        console.log("success");

        const db = request.result;
        /* if (!db.objectStoreNames.contains("images")) {
            db.createObjectStore("images");
        } */

        const transaction = db.transaction("images", "readwrite");
        const store = transaction.objectStore("images");

        store.put(blob, "localAvatar");
    };
}

export function loadAvatar() {
    return new Promise<ImageBitmap>((resolve, reject) => {
        const request = indexedDB.open(IDBName, 4);

        request.onupgradeneeded = () => {
            request.result.createObjectStore("images");
        };

        request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("images")) {
                console.log("makensave");

                // gotta make n save it
                const newAvatar = generateEmptyAvatar();
                saveAvatar(newAvatar).then(() => {
                    resolve(newAvatar);
                });
                return;
            }
            const transaction = db.transaction("images", "readonly");
            const store = transaction.objectStore("images");
            const getRequest = store.get("localAvatar");

            console.log("getting my shi");

            getRequest.onsuccess = () => {
                console.log(getRequest.result);

                const blob = getRequest.result;
                if (blob) {
                    createImageBitmap(blob).then((i) => {
                        console.log(`avatar loaded`, i);
                        resolve(i);
                    });
                } else {
                    // gotta make n save it
                    const newAvatar = generateEmptyAvatar();
                    saveAvatar(newAvatar).then(() => {
                        resolve(newAvatar);
                    });
                }
            };
        };
    });
}

export function cropAvatar(avatar: HTMLImageElement, size = 256) {
    const [c, ctx] = createOffscreenCanvas(size, size);

    const min = Math.min(avatar.width, avatar.height);
    const scale = size / min;

    ctx.translate(size / 2, size / 2);
    ctx.scale(scale, scale);
    ctx.drawImage(avatar, -avatar.width / 2, -avatar.height / 2);

    return c.transferToImageBitmap();
}
