import { Scene } from "../../lib/engine/scene";
import { ExampleObject } from "../objects/example";

export class ExampleScene extends Scene {
    constructor() {
        super();

        let exampleObject = new ExampleObject();
        this.add(exampleObject);
    }
}
