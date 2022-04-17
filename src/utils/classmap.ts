// TODO: string config
import { Class } from "../types/class";
import { nameSymbol } from "../config/symbols";
import { typeID } from "./type_id";

declare global {
    interface Function {
        [nameSymbol]?: string;
    }

    interface Array<T> {
        [nameSymbol]?: string;
    }
}

export const getClassName = (c: Class | string): string => {
    if (typeof c === "string") return c;
    return c[nameSymbol] || c.name;
};

export const getInstanceName = (instance: any, name?: string): string => {
    if (name !== undefined) return name;
    return instance.constructor[nameSymbol] || instance.constructor.name;
};

export class ClassMap<C extends object = any> {
    private readonly map: Map<string, any> = new Map();

    get size() {
        return this.map.size;
    }
    private parseKey(key: Class<C> | string): string {
        return typeof key === "string" ? key : typeID(key);
    }

    get<T>(key: Class<T> | string): T {
        return this.map.get(typeID(key));
    }

    has(key: Class<C> | string) {
        return this.map.has(getClassName(key));
    }

    set(instance: C, name?: string): ClassMap {
        this.map.set(getInstanceName(instance, name), instance);
        return this;
    }

    delete(key: Class<C> | string): boolean {
        return this.map.delete(getClassName(key));
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
