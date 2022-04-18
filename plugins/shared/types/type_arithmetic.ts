export type Length<T extends any[]> = Extract<
    T extends { length: infer L } ? L : never, number>;
    
export type BuildTuple<L extends number, T extends any[] = []> = 
    T extends { length: L } ? T : BuildTuple<L, [...T, any]>;

export type MultiAdd<N extends number, A extends number, I extends number> =
    I extends 0
        ? A
        : UnsafeAdd<N, A> extends number
            ? MultiAdd<N, UnsafeAdd<N, A>, UnsafeSubtract<I, 1>>
            : never;

export type AtTerminus<A extends number, B extends number> =
    A extends 0
        ? true
        : (B extends 0 ? true : false);

export type EQ<A, B> =
    A extends B
        ? (B extends A ? true : false)
        : false;

export type LT<A extends number, B extends number> =
    AtTerminus<A, B> extends true
        ? EQ<A, B> extends true
            ? false
            : (A extends 0 ? true : false)
        : LT<UnsafeSubtract<A, 1>, UnsafeSubtract<B, 1>>;

export type MultiSub<N extends number, D extends number, Q extends number> =
    LT<N, D> extends true
        ? Q
        : UnsafeAdd<Q, 1> extends number
            ? MultiSub<UnsafeSubtract<N, D>, D, UnsafeAdd<Q, 1>>
            : never;

export type IsPositive<N extends number> =
    `${N}` extends `-${number}`
        ? false
        : true;

export type IsWhole<N extends number> =
    `${N}` extends `${number}.${number}`
        ? false
        : true;

export type IsValid<N extends number> =
    IsPositive<N> extends true
        ? (IsWhole<N> extends true ? true : false)
        : false;

export type AreValid<A extends number, B extends number> =
    IsValid<A> extends true
        ? (IsValid<B> extends true ? true : false)
        : false;

// Arithmetical types
export type UnsafeAdd<A extends number, B extends number> =
    Length<[...BuildTuple<A>, ...BuildTuple<B>]>;

export type UnsafeSubtract<A extends number, B extends number> =
    BuildTuple<A> extends [...(infer U), ...BuildTuple<B>]
        ? Length<U>
        : never;

export type UnsafeMultiply<A extends number, B extends number> =
    MultiAdd<A, 0, B>;

export type UnsafeDivide<A extends number, B extends number> =
    MultiSub<A, B, 0>;

export type UnsafeModulo<A extends number, B extends number> =
    LT<A, B> extends true
        ? A
        : UnsafeModulo<UnsafeSubtract<A, B>, B>;

// Safeguarded arithmetical types
export type Add<A extends number, B extends number> =
    AreValid<A, B> extends true
        ? UnsafeAdd<A, B>
        : never;

export type Subtract<A extends number, B extends number> =
    AreValid<A, B> extends true
        ? UnsafeSubtract<A, B>
        : never;

export type Multiply<A extends number, B extends number> =
    AreValid<A, B> extends true
        ? UnsafeMultiply<A, B>
        : never;

export type Divide<A extends number, B extends number> =
    AreValid<A, B> extends true
        ? UnsafeDivide<A, B>
        : never;

export type Modulo<A extends number, B extends number> =
    AreValid<A, B> extends true
        ? UnsafeModulo<A, B>
        : never;
