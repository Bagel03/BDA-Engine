// TODO: string config
import { Class } from "../types/class";
import { typeID } from "./type_id";

export class ClassMap<C extends object = any> {
    private readonly map: Map<string, any> = new Map();

    get size() {
        return this.map.size;
    }

    private parseKey(key: Class<C> | string): string {
        return typeof key === "string" ? key : typeID(key);
    }

    get<T extends C>(key: Class<T> | string): T {
        return this.map.get(this.parseKey(key));
    }

    has(key: Class<C> | string) {
        return this.map.has(this.parseKey(key));
    }

    set(instance: C, name?: string): ClassMap {
        this.map.set(name === undefined ? typeID(instance) : name, instance);
        return this;
    }

    delete(key: Class<C> | string): boolean {
        return this.map.delete(this.parseKey(key));
    }

    clear() {
        this.map.clear();
    }

    forEach(
        callbackfn: (
            value: C,
            key: Class<C> | string,
            map: Map<Class<C> | string, any>
        ) => void,
        thisArg?: any
    ): void {
        this.map.forEach(callbackfn, thisArg);
    }
}
