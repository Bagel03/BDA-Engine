export type Class<T = any> = {
    new (...args: any[]): T;
};

export type ConstructorFunction<T = any> = Function & Class<T>;

export type classType<I extends {}> = I extends Class<infer T> ? T : never;
