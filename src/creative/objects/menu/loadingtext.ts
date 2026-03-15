import { font, globalTimer } from "../../../lib/engine/engine";
import { shuffle } from "../../../lib/engine/utils";
import { HCText } from "../../../lib/ui/hctext";

const messages = [
    "Grabbing blocks...",
    "Readying up...",
    "Acquiring blast tokens...",
    "Becoming creative...",
    "Picking up pencils...",
    "Verbing nouns...",
    "Getting money...",
    "Staying in school...",
    "Eating vegetables...",
    "Reticulating splines...",
    "Gathering resources...",
    "Preparing rats...",
];

const msPerChar = 50;
const hideTime = 200;
const textShowTime = 3000;

type AnimationPhase = "type" | "hold" | "untype" | "hold2";

export class LoadingText extends HCText {
    private _messages: string[] = [];
    private _currentMessageIndex: number = 0;

    private _lastCharTime = 0;
    private _lastTextTime = 0;
    private _state: AnimationPhase = "type";

    overrideText: string = "";

    constructor() {
        super();

        this._messages = [...messages];
        shuffle(this._messages);

        this.text = "";
        this.anchor = "cc";
        this.font = font(96);
    }

    update(): void {
        if (this.overrideText.length > 0) {
            this.text = this.overrideText;
            return;
        }

        let msg = this._messages[this._currentMessageIndex];
        switch (this._state) {
            case "type":
                if (globalTimer - this._lastCharTime >= msPerChar) {
                    this.text = msg.substring(0, this.text.length + 1);
                    if (this.text.length == msg.length) {
                        this._state = "hold";
                        this._lastTextTime = globalTimer;
                    }
                    this._lastCharTime = globalTimer;
                }
                break;
            case "hold":
                if (globalTimer - this._lastTextTime >= textShowTime) {
                    this._state = "untype";
                }
                break;
            case "untype":
                if (globalTimer - this._lastCharTime >= msPerChar) {
                    this.text = msg.substring(0, this.text.length - 1);
                    if (this.text.length == 0) {
                        this._currentMessageIndex++;
                        if (this._currentMessageIndex >= this._messages.length) {
                            this._currentMessageIndex = 0;
                        }
                        this._lastTextTime = globalTimer;
                        this._state = "hold2";
                    }
                    this._lastCharTime = globalTimer;
                }
                break;
            case "hold2":
                if (globalTimer - this._lastTextTime >= hideTime) {
                    this._state = "type";
                }
                break;
        }
    }
}
