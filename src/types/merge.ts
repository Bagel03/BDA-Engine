export type MergeTypes<T extends unknown[]> = T extends [
    a: infer A,
    ...rest: infer R
]
    ? A & MergeTypes<R>
    : {};
