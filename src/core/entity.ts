import { generateID } from "../utils/id";
import { World } from "./world";
import { Class } from "../types/class";
import { ClassMap, key } from "../utils/classmap";
import { typeID } from "../utils/type_id";
import { Logger, LoggerColors } from "../utils/logger";
import { assert } from "../utils/assert";

export interface ComponentNames {}

export class Entity {
    private readonly components: ClassMap<any> = new ClassMap();

    constructor(
        public readonly world: World,
        public readonly id = generateID()
    ) {}

    get<T extends keyof ComponentNames>(name: T): ComponentNames[T];
    get<T>(component: Class<T> | key): T;

    get(component: Class | keyof ComponentNames | key): any {
        return this.components.get(component);
    }

    has(component: Class<any> | keyof ComponentNames | key): boolean {
        return this.components.has(component);
    }

    add(component: any, name?: key | keyof ComponentNames): Entity {
        this.components.set(component, name);

        this.world._entityAttachComponent(
            this,
            name ? name : typeID(component.constructor)
        );
        return this;
    }

    tag(name: key): Entity {
        this.add(null, name);
        return this;
    }

    remove(component: string | any): Entity {
        this.components.delete(component);

        this.world._entityRemoveComponent(
            this,
            typeof component === "string" ? component : typeID(component)
        );
        return this;
    }

    clear(): Entity {
        this.components.forEach((component, name) => this.remove(name));
        return this;
    }

    forEach(callbackfn: (value: any, key: key) => void, thisArg?: any): Entity {
        this.components.forEach(callbackfn, thisArg);
        return this;
    }

    [Symbol.iterator](): IterableIterator<[key, any]> {
        return this.components[Symbol.iterator]();
    }

    private static readonly logger = new Logger("Entity", LoggerColors.purple);

    // Plugins stuff
    private static readonly overrides: (keyof Entity)[] = [];
    private static readonly protectedMethods: (keyof Entity)[] = [
        "add",
        "clear",
        "forEach",
        "get",
        "has",
        "remove",
        "tag",
    ];
    static override<
        M extends keyof Entity,
        O extends Extract<Entity[M], (...args: any) => any>
    >(method: M, override: O): void {
        assert(
            !this.overrides.includes(method),
            `Method ${method} is already overridden`
        );
        assert(
            !this.protectedMethods.includes(method),
            `Method ${method} is protected`
        );

        this.prototype[method] = override;
        this.overrides.push(method);

        this.logger.log(`Method ${method} is now overridden`);
    }
}
