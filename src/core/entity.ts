import { ClassMap, key, keyify } from "../utils/classmap";
import { World } from "./world";
import { Class } from "../types/class";
import { assert } from "../utils/assert";

export interface defaultComponents {
    [key: key]: any;
}

export class Entity {
    private static readonly defaultComponents: Record<key, (ent: Entity) => any> = {}; 
    static addDefaultComponent(key: key|Class, func: () => any) {
        this.defaultComponents[keyify(key)] = func;
    } 

    /** @internal */
    world?: World;

    private readonly components: ClassMap; 

    constructor(public readonly id: key) {
        this.components = new ClassMap();
    }

    get<T extends keyof defaultComponents>(key: T): defaultComponents[T];
    get<T>(key: key | Class<T>): T|undefined;

    get(key: key | Class<any>): any {
        if(!this.has(key) && Entity.defaultComponents[keyify(key)]) {
            this.add(Entity.defaultComponents[keyify(key)](this), keyify(key))
        }
        return this.components.get(key);
    }

    add(instance: any, name?: key) {
        this.components.add(instance, name);
        this.world?.queryEvent(this, name ? name : instance.class);
        return this;
    }

    has(component: key | Class) {
        return this.components.has(component);
    }

    remove(name: Class | key) {
        this.components.delete(name);
        this.world?.queryEvent(this, keyify(name));
        return this;
    }
}
