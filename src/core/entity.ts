import { Class, ClassMap, key } from "../utils/classmap";

export interface defaultComponents {
    [key: key]: any;
}

export class Entity extends ClassMap {
    constructor(public readonly id: key) {
        super();
    }

    get<T extends keyof defaultComponents>(key: T): defaultComponents[T];
    get<T>(key: key | Class<T>): T;

    get(key: key | Class<any>): any {
        super.get(key);
    }
}
