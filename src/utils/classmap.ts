// TODO: string config
import { Class } from "../types/class";
import { nameSymbol } from "../config/symbols";

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

    get<T>(key: Class<T> | string): T {
        // if(globalConfig.saveConstructorNamesAsStringsInClassMaps)
        //     return this.map.get((key as T).name) as InstanceType<T>;

        return this.map.get(getClassName(key));
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

export type NamedClassMap<N extends string, C extends object = any> = Record<
    `${Lowercase<N>}ClassMap`,
    ClassMap<C>
> &
    Record<`get${Capitalize<N>}`, <T>(key: Class<T> | string) => T> &
    Record<`has${Capitalize<N>}`, (key: Class<C> | string) => boolean> &
    Record<`add${Capitalize<N>}`, (instance: C, name?: string) => void> &
    Record<`delete${Capitalize<N>}`, (key: Class<C> | string) => boolean> &
    Record<`clear${Capitalize<N>}s`, () => void> &
    Record<
        `forEach${Capitalize<N>}`,
        (
            callbackfn: (
                value: C,
                key: Class<C> | string,
                map: Map<Class<C> | string, any>
            ) => void,
            thisArg?: any
        ) => void
    > extends infer O
    ? { [K in keyof O]: O[K] }
    : never;

export const NamedClassMap = <N extends string, C extends object = any>(
    name: N
) => {
    const lowerName = name.toLowerCase();
    const capitalName = name[0].toUpperCase() + name.substring(1);

    return class {
        [k: string]: any;
        constructor() {
            this[`${lowerName}ClassMap`] = new ClassMap();
        }

        [`get${capitalName}`]<T>(key: Class<T> | string): T {
            return this[`${lowerName}ClassMap`].get(key);
        }

        [`has${capitalName}`](key: Class<C> | string) {
            return this[`${lowerName}ClassMap`].has(key);
        }

        [`add${capitalName}`](instance: C, name?: string) {
            this[`${lowerName}ClassMap`].set(instance, name);
        }

        [`delete${capitalName}`](key: Class<C> | string) {
            return this[`${lowerName}ClassMap`].delete(key);
        }

        [`clear${capitalName}s`]() {
            this[`${lowerName}ClassMap`].clear();
        }

        [`forEach${capitalName}`](
            callbackfn: (
                value: C,
                key: Class<C> | string,
                map: Map<Class<C> | string, any>
            ) => void,
            thisArg?: any
        ) {
            this[`${lowerName}ClassMap`].forEach(callbackfn, thisArg);
        }
    } as new () => NamedClassMap<N>;
};
