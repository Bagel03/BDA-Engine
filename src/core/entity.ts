import { generateID } from "../utils/id";
import { World } from "./world";
import { Class } from "../types/class";
import { ClassMap } from "../utils/classmap";

export class Entity {
    private readonly components: ClassMap<any> = new ClassMap();

    constructor(
        public readonly world: World,
        public readonly id = generateID()
    ) {}

    get<T>(component: Class<T> | string): T {
        return this.components.get(component);
    }

    has(component: Class<any> | string): boolean {
        return this.components.has(component);
    }

    add(component: any, name?: string): Entity {
        this.components.set(component, name);
        return this;
    }

    remove(component: any): Entity {
        this.components.delete(component);
        return this;
    }

    clear(): Entity {
        this.components.clear();
        return this;
    }

    forEach(
        callbackfn: (value: any, key: Class<any> | string) => void,
        thisArg?: any
    ): Entity {
        this.components.forEach(callbackfn, thisArg);
        return this;
    }
}
