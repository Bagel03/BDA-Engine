import { Entity } from "../core/entity";
import { protectedComponentSymbol, nameSymbol } from "../config/symbols";
import { GameObject } from "../core/game_object";
import { System } from "../core/system";
import { Class, classType } from "../types/class";
import { MergeTypes } from "../types/merge";

export const name = (name: string) => (target: any) => {
    target[nameSymbol] = name;
    return target;
};

export const protectedComponent = (target: any) => {
    target[protectedComponentSymbol] = true;
    return target;
};

export const defaultComponent =
    (...args: any[]) =>
    (target: any) => {
        GameObject.defaultComponents.push({ component: target, args });
        return target;
    };

export const defaultSystem = <T extends Entity = Entity>(
    target: Class<System<T>>
) => {
    GameObject.defaultSystems.push(target);
    return target;
};

const caches: Map<(...args: any[]) => any, Map<string, any>> = new Map();
export const cache = <F extends (...args: any[]) => any>(fn: F) => {
    return function (...args: Parameters<F>) {
        let cache = caches.get(fn);

        if (cache) {
            const stored = cache.get(args.toString());
            if (stored) return stored;
        } else {
            cache = new Map();
            caches.set(fn, cache);
        }

        const result = fn(args);
        caches.get(fn)?.set(args.toString(), result);
        return result as ReturnType<F>;
    } as F;
};
