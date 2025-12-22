const path = require("path");
const fs = require("fs/promises");
const express = require("express");

process.title = "High Chaos";

const WEB_ROOT = path.join(process.cwd(), "web");

let app = express();

const logColors = {
    time: "\x1b[0m\x1b[97m",
    ip: "\x1b[0m\x1b[92m ",
    method: "\x1b[0m\x1b[94m ",
    url: "\x1b[0m\x1b[93m ",
    statusOK: "\x1b[0m\x1b[32m ",
    statusERR: "\x1b[0m\x1b[31m ",
    statusOTHER: "\x1b[0m\x1b[36m ",
    end: "\x1b[0m",
};

function loggerGetCurrentTimeStr(now) {
    return (
        "[" +
        now.getFullYear().toString().padStart(4, "0") +
        "/" +
        (now.getMonth() + 1).toString().padStart(2, "0") +
        "/" +
        now.getDate().toString().padStart(2, "0") +
        " " +
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0") +
        ":" +
        now.getSeconds().toString().padStart(2, "0") +
        "]"
    );
}

function log(req, res, url) {
    const timeString = loggerGetCurrentTimeStr(new Date());
    const requestIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress.substring(7);
    const method = req.method;
    const status = res.statusCode.toString();
    console.log(
        [
            logColors.time,
            timeString,
            logColors.ip,
            requestIP,
            logColors.method,
            method,
            logColors.url,
            url,
            status.startsWith("2")
                ? logColors.statusOK
                : status.startsWith("4") || status.startsWith("5")
                ? logColors.statusERR
                : logColors.statusOTHER,
            status,
            logColors.end,
        ].join("")
    );
}

app.get("/", (req, res) => {
    //res.sendFile(path.join(WEB_ROOT, "index.html"));
    res.type("html").status(400).send("<a href='/game/highchaos'>Play</a>"); // TODO make this not awful
    log(req, res, req.url);
});
app.get("/game/*game", async (req, res) => {
    const content = await fs.readFile(path.join(WEB_ROOT, "game.html"), "utf8");
    res.type("html").send(content.replace(/%game%/g, req.params.game));
    log(req, res, req.url);
});

app.get("*path", (req, res) => {
    try {
        let p = path.join(WEB_ROOT, req.path);
        fs.access(p)
            .then(() => {
                res.sendFile(p);
                log(req, res, req.url);
            })
            .catch((e) => {
                let p2 = path.join(WEB_ROOT, req.path + ".js");
                fs.access(p2)
                    .then(() => {
                        res.sendFile(p2);
                        log(req, res, req.url);
                    })
                    .catch((e) => {
                        res.status(404).send("<h1>404 File Not Found</h1>");
                        log(req, res, req.url);
                    });
            });
    } catch (e) {
        console.log(e);
        res.status(500).send("<h1>Error 500</h1>");
        log(req, res, req.url);
    }
});

app.listen(3165);
console.log("High Chaos listening!");
