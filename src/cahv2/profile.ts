import { socket } from "./network";
import { generateEmptyAvatar, IDBName } from "./utils";

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

loadAvatar().then((a) => (currentAvatar = a));

export async function setAvatar(a: ImageBitmap) {
    currentAvatar = a;
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

    const request = indexedDB.open(IDBName, 2);

    request.onupgradeneeded = () => {
        request.result.createObjectStore("images");
    };

    request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("images", "readwrite");
        const store = transaction.objectStore("images");

        store.put(blob, "localAvatar");
    };
}

export function loadAvatar() {
    return new Promise<ImageBitmap>((resolve, reject) => {
        const request = indexedDB.open(IDBName, 1);

        request.onsuccess = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("images")) {
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

            getRequest.onsuccess = () => {
                const blob = getRequest.result;
                if (blob) {
                    createImageBitmap(blob).then((i) => {
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
