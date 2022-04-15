import { NamedClassMap } from "../utils/classmap";
import { generateID } from "../utils/id";
import { resetSymbol } from "../config/symbols";
import { World } from "./world";

export class Entity extends NamedClassMap("component") {
    constructor(
        public readonly world: World,
        public readonly id = generateID()
    ) {
        super();
    }

    [`addComponent`] = (component: any, name?: string) => {
        this.componentClassMap.set(component, name);
        this.world.entityAttachComponent(this, component.constructor);
    };

    [resetSymbol](world: World, id: string) {
        //@ts-ignore
        this.world = world;
        //@ts-ignore
        this.id = id;
    }
}
