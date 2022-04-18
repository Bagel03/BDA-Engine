export type ArrayLengthMutationKeys = "";
// | "splice"
// | "push"
// | "pop"
// | "shift"
// | "unshift";
export type FixedLengthArray<
    T,
    L extends number,
    TObj = [T, ...Array<T>]
> = Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>> & {
    readonly length: L;
    [I: number]: T;
    [Symbol.iterator]: () => IterableIterator<T>;
};

export type FixedLength2dArray<
    W extends number,
    H extends number,
    T
> = FixedLengthArray<FixedLengthArray<T, W>, H>;
