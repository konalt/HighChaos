import { setScene } from "../../lib/engine/engine";
import { Scene, UI_LAYER } from "../../lib/engine/scene";
import { CAHErrorBox } from "../objects/ui/errorbox";
import { CAHSceneTransition } from "../objects/ui/scenetransition";

export class CAHBaseScene extends Scene {
    error: CAHErrorBox;
    sceneTransition: CAHSceneTransition;

    constructor() {
        super();

        this.error = new CAHErrorBox();
        this.add(this.error, UI_LAYER + 10);

        this.sceneTransition = new CAHSceneTransition();
        this.add(this.sceneTransition, UI_LAYER + 20);
    }

    async init(data?: any) {
        super.init(data);

        if (data && data.uncover) {
            this.sceneTransition.instaCover();
            setTimeout(() => {
                this.sceneTransition.uncover();
            }, 100);
        }
    }

    transitionToScene(scene: CAHBaseScene) {
        this.sceneTransition.cover(() => {
            setScene(scene, false, {
                uncover: true,
            });
        });
    }
}
