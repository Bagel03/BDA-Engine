import { assert } from "../utils/assert";
import { Logger, LoggerColors } from "../utils/logger";
import { WithOnlyType } from "../types/with";
import { generateID } from "../utils/id";
import { Class } from "../types/class";
import { Entity } from "./entity";
import { System } from "./system";

type GameObjectMethods = WithOnlyType<GameObject, (...args: any[]) => any>;
const logger = new Logger("Game Object", LoggerColors.blue);

/**
 * @description A wrapper for most entities that allows extending
 */
export class GameObject extends Entity {
    static defaultComponents: {
        component: Class;
        args?: any[];
    }[] = [];
    static defaultSystems: (Class<System> | string)[] = [];

    constructor(id: string = generateID()) {
        super(id);

        GameObject.defaultComponents.forEach((obj) =>
            this.addComponent(
                new obj.component(this, ...(obj.args ? obj.args : []))
            )
        );
        GameObject.defaultSystems.forEach((sys) => this.enableSystem(sys));
    }

    static overloads: string[] = [];

    static addMethod<
        N extends keyof GameObjectMethods,
        M extends GameObject[N]
    >(
        name: N,
        method: (this: GameObject, ...args: Parameters<M>) => ReturnType<M>
    ) {
        assert(
            !this.overloads.includes(name),
            `Tried to add a gameObject method twice`
        );

        (this.prototype[name] as M) = method as M;
        this.overloads.push(name);
        logger.log(`Added method ${name} to all GameObjects`);
    }
}
