import { Logger, LoggerColors } from "./logger";

type Assert = (condition: unknown, message?: string) => asserts condition;

const logger = new Logger("assert", LoggerColors.red);
export const assert: Assert = (
    condition: any,
    message?: string
): asserts condition => {
    if (!condition) {
        logger.error("Assertion Failed: ", message);
        throw new Error(message);
    }
};
