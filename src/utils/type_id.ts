import { Logger } from "./logger";
import { Class } from "../types/class";

export const type = Symbol("type");
const logger = new Logger("TypeId");
let currentType = 0;

export type TypeID = string;

declare global {
    interface Function {
        [type]?: TypeID;
    }
}

export const typeName =
    (id: TypeID) =>
    (target: Class): Class => {
        target[type] = id;
        return target;
    };

export const typeID = (object: object | Class<any>): TypeID => {
    if (typeof object === "function") {
        return classID(object as Class);
    }

    if (object.constructor[type] === undefined) {
        object.constructor[type] = (currentType++).toString();
        logger.info(`Created type id for ${object.constructor.name}`);
    }

    return object.constructor[type]!;
};

const classID = (constructor: Class<any>): TypeID => {
    if (constructor[type] === undefined) {
        constructor[type] = (currentType++).toString();
        logger.info(`Created type id for ${constructor.name}`);
    }

    return constructor[type]!;
};
