import { Logger, LoggerColors } from "../utils/logger";
import { Class } from "../types/class";
import { typeID, TypeID } from "../types/type_id";
import { resetSymbol } from "../config/symbols"


declare global {
    interface Function {
        [resetSymbol]?: (...args: any) => any;
    }
}

export class ObjectPool {
    private readonly pools: Map<TypeID, Array<any>> = new Map();
    private readonly logger: Logger = new Logger("ObjectPool", LoggerColors.teal);

    private reset<T extends Class>(obj: InstanceType<T>, ...prams: ConstructorParameters<T>): void {
        if(obj.constructor[resetSymbol]) {
            obj.constructor[resetSymbol].apply(obj, prams);
        } else {
            try {
                obj.constructor.apply(obj, prams);
            } catch (e) {
                this.logger.error(`Failed to reset ${obj.constructor.name}, please add a reset method or mark it as non-poolable`);
            }
        }
    }

    public new<T extends Class>(type: T, ...prams: ConstructorParameters<T>): InstanceType<T> {
        const pool = this.pools.get(typeID(type));
        if (pool) {
            const obj = pool.pop();
            if (obj) {
                this.reset(obj, ...prams)
                return obj;
            }
        }
        return new type(...prams);
    }

    public free<T extends object>(obj: T): void {
        const pool = this.pools.get(typeID(obj.constructor));
        if (pool) {
            pool.push(obj);
        } else {
            this.pools.set(typeID(obj.constructor), [obj]);
        }
    }

    public extend<T extends Class>(type: T, amount: number = 5) {
        const pool = this.pools.get(typeID(type));
        if (pool) {
            for (let i = 0; i < amount; i++) {
                pool.push(new type());
            }
        } else {
            this.pools.set(typeID(type), new Array(amount).fill(new type()));
        }
    }
}
