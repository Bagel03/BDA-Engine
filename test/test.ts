type Ent<T extends any = any> = any;
type Query<T> = any;

/** @system */
function mySys(myQuery: Query<[Ent]>) {}
