import { Logger } from "./logger";
import { Class } from "../types/class";
import { typeSymbol } from "../config/symbols";
import { generateID } from "./id";

const logger = new Logger("TypeId");

export type TypeID = string;

declare global {
    interface Function {
        [typeSymbol]?: TypeID;
    }
}

export const typeName =
    (id: TypeID) =>
    (target: Class): Class => {
        target[typeSymbol] = id;
        return target;
    };

export const typeID = (object: object | Class<any>): TypeID => {
    if (typeof object === "function") {
        return classID(object as Class);
    }

    if (object.constructor[typeSymbol] === undefined) {
        object.constructor[typeSymbol] = generateID();
        logger.info(`Created type id for ${object.constructor.name}`);
    }

    return object.constructor[typeSymbol]!;
};

const classID = (constructor: Class<any>): TypeID => {
    if (constructor[typeSymbol] === undefined) {
        constructor[typeSymbol] = generateID();
        logger.info(`Created type id for ${constructor.name}`);
    }

    return constructor[typeSymbol]!;
};
