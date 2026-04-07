import { deltaTime, font, globalTimer, h, setScene, w } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { HCButton } from "../../lib/ui/hcbutton";
import { HCInput } from "../../lib/ui/hcinput";
import { HCText } from "../../lib/ui/hctext";
import { socket } from "../game/game";
import { gameSettings } from "../game/settings";
import { PACKET } from "../net/packets";
import { Sidebar } from "../objects/menu/sidebar";
import { TutorialPrompt } from "../objects/menu/tutorialprompt";
import { Sky } from "../objects/sky";
import { Title } from "../objects/ui/title";
import { World } from "../objects/world";
import { InGameScene } from "./ingame";

export class MenuScene extends Scene {
    sky: Sky;
    world: World;
    sidebar: Sidebar;

    title: Title;

    nameInput: HCInput;
    playButton: HCButton;

    tutorialPrompt: TutorialPrompt | undefined;

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
        this.title.anchor = "cc";
        this.title.src = "creative/txt/title.png";
        this.add(this.title, UI_LAYER);

        this.playButton = new HCButton();
        this.playButton.x = w / 2;
        this.playButton.y = h / 2;
        this.playButton.font = font(62, "bold");
        this.playButton.text = "Play";
        this.playButton.onClick = () => {
            this.playButton.ignore = true;
            this.nameInput.ignore = true;

            this._join();

            // TODO: add tutorial
            /* this.tutorialPrompt = new TutorialPrompt();
            this.tutorialPrompt.onJoinPressed = () => {
                this._join();
            };
            this.tutorialPrompt.onTutorialPressed = () => {
                // TODO: add tutorial
                console.log("add tutorial");
            };
            this.add(this.tutorialPrompt, UI_LAYER); */
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

        this.world = new World();
        this.add(this.world);
    }

    update(): void {
        super.update();

        this.camera.x = Math.cos(globalTimer * 0.0001 - Math.PI) * 500;
        this.camera.y = 5 * gameSettings.blockSize - h / 2;
    }

    private _join() {
        socket.emit(PACKET.CS_PLAYER_JOIN);
        setScene(new InGameScene());
    }
}
