import { font, globalTimer, h, setScene, w } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { HCButton } from "../../lib/ui/hcbutton";
import { HCInput } from "../../lib/ui/hcinput";
import { HCText } from "../../lib/ui/hctext";
import { socket } from "../game/game";
import { PACKET } from "../net/packets";
import { Sidebar } from "../objects/menu/sidebar";
import { Sky, SKY_HEIGHT } from "../objects/sky";
import { Title } from "../objects/ui/title";
import { InGameScene } from "./ingame";

export class MenuScene extends Scene {
    sky: Sky;
    sidebar: Sidebar;

    title: Title;

    nameInput: HCInput;
    playButton: HCButton;

    constructor() {
        super();

        this.sky = new Sky();
        this.add(this.sky);

        this.sidebar = new Sidebar();
        this.sidebar.width = 820;
        this.sidebar.opacity = 0.7;
        this.add(this.sidebar, UI_LAYER);

        this.title = new Title();
        this.title.x = w / 2;
        this.title.y = 180;
        this.title.scale = 1.2;
        this.title.src = "creative/txt/title.png";
        this.add(this.title, UI_LAYER);

        this.playButton = new HCButton();
        this.playButton.x = w / 2;
        this.playButton.y = h / 2;
        this.playButton.font = font(62, "bold");
        this.playButton.text = "Play";
        this.playButton.onClick = () => {
            this.join();
        };
        this.add(this.playButton, UI_LAYER);

        let nameInputLabel = new HCText();
        nameInputLabel.x = w / 2 - this.sidebar.width / 2 + 20;
        nameInputLabel.y = 402;
        nameInputLabel.anchor = "cl";
        nameInputLabel.font = font(36);
        nameInputLabel.text = "Username";
        this.add(nameInputLabel, UI_LAYER);

        this.nameInput = new HCInput();
        this.nameInput.x = w / 2 - this.sidebar.width / 2 + 200;
        this.nameInput.y = 400;
        this.nameInput.textWidth = 300;
        this.nameInput.maxMode = "width";
        this.nameInput.anchor = "cl";
        this.nameInput.font = font(32);
        this.nameInput.placeholder = "Username...";
        this.nameInput.onTextUpdate = (text: string) => {
            localStorage.setItem("creative_username", text);
            socket.emit(PACKET.CS_PLAYER_USERNAME, text);
            return true;
        };
        this.nameInput.value = localStorage.getItem("creative_username") ?? "Guest";
        this.nameInput.onTextUpdate(this.nameInput.value);
        this.add(this.nameInput, UI_LAYER);
    }

    update(): void {
        super.update();

        this.camera.y = -(Math.cos(globalTimer * 0.00002 + Math.PI) / 2 + 0.5) * SKY_HEIGHT;
    }

    private join() {
        socket.emit(PACKET.CS_PLAYER_JOIN);
        setScene(new InGameScene());
    }
}
