// TODO: string config
import { Class } from "../types/class";
import { typeID } from "./type_id";

export type key = string | number | symbol;
export const isKey = (key: any): key is key => {
    return (
        typeof key === "string" ||
        typeof key === "number" ||
        typeof key === "symbol"
    );
};

export class ClassMap<C extends object = any> {
    private readonly map: Map<key, any> = new Map();

    get size() {
        return this.map.size;
    }

    private parseKey(key: Class<C> | key): key {
        return isKey(key) ? key : typeID(key);
    }

    get<T extends C>(key: Class<T> | key): T {
        return this.map.get(this.parseKey(key));
    }

    has(key: Class<C> | key) {
        return this.map.has(this.parseKey(key));
    }

    set(instance: C, name?: key): ClassMap {
        this.map.set(name === undefined ? typeID(instance) : name, instance);
        return this;
    }

    delete(key: Class<C> | key): boolean {
        return this.map.delete(this.parseKey(key));
    }

    clear() {
        this.map.clear();
    }

    forEach(
        callbackfn: (value: C, key: key, map: Map<key, any>) => void,
        thisArg?: any
    ): void {
        this.map.forEach(callbackfn, thisArg);
    }

    *entries(): IterableIterator<[key, C]> {
        for (const [key, value] of this.map.entries()) {
            yield [key, value];
        }
    }

    *keys(): IterableIterator<key> {
        for (const key of this.map.keys()) {
            yield key;
        }
    }

    *values(): IterableIterator<C> {
        for (const value of this.map.values()) {
            yield value;
        }
    }

    [Symbol.iterator](): IterableIterator<[key, C]> {
        return this.entries();
    }
}
