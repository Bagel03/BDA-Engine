export type WithOnlyType<O, T> = {
    [P in keyof O as O[P] extends T ? P : never]: O[P];
};
