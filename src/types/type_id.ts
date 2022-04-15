import { Logger } from "../utils/logger";
import { Class } from "./class";

export const type = Symbol("type");
const logger = new Logger("TypeId");
let currentType = 0;

declare global {
    interface Function {
        [type]?: number;
    }
}

export type TypeID = number;

export const typeID = (object: object | Class<any>): TypeID => {
    if (typeof object === "function") {
        return classID(object as Class);
    }

    if (object.constructor[type] === undefined) {
        object.constructor[type] = currentType++;
        logger.info(`Created type id for ${object.constructor.name}`);
    }

    return object.constructor[type]!;
};

export const classID = (constructor: Class<any>): TypeID => {
    if (constructor[type] === undefined) {
        constructor[type] = currentType++;
        logger.info(`Created type id for ${constructor.name}`);
    }

    return constructor[type]!;
};
