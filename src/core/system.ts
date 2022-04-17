import { defaultSymbol, defaultSystemType } from "../config/symbols";
import { Class } from "../types/class";
import { Entity } from "./entity";
import { World } from "./world";

enum EntityEvent {
    Added,
    Removed,
}

interface QueryMetadata {
    interestedIn: (Class | EntityEvent)[];
    persistent: boolean;
}

enum QueryResult {
    Add,
    Remove,
    None,
}

interface QueryModifier {
    metadata: QueryMetadata;
    test: (entity: Entity) => QueryResult;
}

type keyQ<Q extends Record<string, QueryModifier> | QueryModifier> =
    Q extends QueryModifier ? Q : keyof Q;

export abstract class System<Q extends Record<string, any> | any> {
    private readonly queriesToEntities: Q extends QueryModifier
        ? {
              [defaultSymbol]: Map<string, Entity>;
          }
        : {
              [id in keyof Q]: Map<string, Entity>;
          };

    private readonly addedQueries: (keyof Q)[] = [];
    private readonly removedQueries: (keyof Q)[] = [];
    private readonly componentsToQueries: Map<Class, (keyof Q)[]> = new Map();
    private readonly queriesToClear: (keyof Q)[] = [];

    protected get entities(): Q extends QueryModifier
        ? Map<string, Entity>
        : {
              [id in keyof Q]: Map<string, Entity>;
          } {
        return this.queriesToEntities[defaultSymbol]
            ? this.queriesToEntities[defaultSymbol]
            : this.queriesToEntities;
    }

    // For use by world only
    private entityAdded(entity: Entity) {
        this.addedQueries.forEach((query) => {
            const result = this.queries[query].test(entity);
            if (result === QueryResult.None) return;

            if (result === QueryResult.Add) {
                return this.queriesToEntities[query].set(entity.id, entity);
            }

            if (result === QueryResult.Remove) {
                return this.queriesToEntities[query].delete(entity.id);
            }
        });
    }

    private entityRemoved(entity: Entity) {
        this.removedQueries.forEach((query) => {
            const result = this.queries[query].test(entity);
            if (result === QueryResult.None) return;

            if (result === QueryResult.Remove) {
                return this.queriesToEntities[query].delete(entity.id);
            }

            if (result === QueryResult.Add) {
                return this.queriesToEntities[query].set(entity.id, entity);
            }
        });
    }

    private componentAdded(entity: Entity, component: Class) {
        const queries = this.componentsToQueries.get(component);
        if (queries) {
            for (const query of queries) {
                const result = this.queries[query].test(entity);
                if (result === QueryResult.None) return;

                if (result === QueryResult.Add) {
                    return this.queriesToEntities[query].set(entity.id, entity);
                }

                if (result === QueryResult.Remove) {
                    return this.queriesToEntities[query].delete(entity.id);
                }
            }
        }
    }

    private componentRemoved(entity: Entity, component: Class) {
        const queries = this.componentsToQueries.get(component);
        if (queries) {
            for (const query of queries) {
                const result = this.queries[query].test(entity);
                if (result === QueryResult.None) return;

                if (result === QueryResult.Add) {
                    return this.queriesToEntities[query].delete(entity.id);
                }

                if (result === QueryResult.Remove) {
                    return this.queriesToEntities[query].set(entity.id, entity);
                }
            }
        }
    }

    getQueryStats() {
        return {
            added: this.addedQueries.length > 0,
            removed: this.removedQueries.length > 0,
            components: Array.from(this.componentsToQueries.keys()),
        };
    }

    constructor(public readonly world: World, private readonly queries: Q) {
        // Set it up
        this.queriesToEntities = {} as any;
        for (const [key, query] of Object.entries(queries) as [
            keyof Q,
            QueryModifier
        ][]) {
            this.queriesToEntities[key] = new Map();
            if (!query.metadata.persistent) this.queriesToClear.push(key);

            for (const interest of query.metadata.interestedIn) {
                // See if it needs to be added
                if (interest === EntityEvent.Added) {
                    this.addedQueries.push(key);
                    continue;
                }
                // Or removed
                if (interest === EntityEvent.Removed) {
                    this.removedQueries.push(key);
                    continue;
                }
                // Otherwise its just a target component
                const queries = this.componentsToQueries.get(interest);
                if (!queries) {
                    this.componentsToQueries.set(interest, [key]);
                } else {
                    queries.push(key);
                }
            }
        }
    }

    updateInternal() {
        this.update();
        this.queriesToClear.forEach((query) => {
            this.queriesToEntities[query].clear();
        });
    }

    update(...args: any[]) {}
}

// Different Query implementations
export const With = (...components: Class[]) => {
    return {
        metadata: {
            interestedIn: components,
            persistent: true,
        },
        test: (entity: Entity) => {
            for (const component of components) {
                if (!entity.has(component)) return QueryResult.Remove;
            }
            return QueryResult.Add;
        },
    };
};

export const Without = (...components: Class[]) => {
    return {
        metadata: {
            interestedIn: components,
            persistent: true,
        },
        test: (entity: Entity) => {
            for (const component of components) {
                if (entity.has(component)) return QueryResult.Remove;
            }
            return QueryResult.Add;
        },
    };
};

export const WithAdded = (...components: Class[]) => {
    return {
        metadata: {
            interestedIn: components,
            persistent: false,
        },
        test: (entity: Entity) => {
            for (const component of components) {
                if (!entity.has(component)) return QueryResult.Add;
            }
            return QueryResult.None;
        },
    };
};

// Query(Added(Foo), With(Bar), Without(Baz), Not(With(Qux)))
// Because it has Added, it will clear regardless of the other queries
// This should add a component if:
// - Foo is added
// - Bar is added
// - Baz is not added
// - Qux is not added

// This should remove a component if:
// - Foo is removed
// - Bar is removed
// - Baz is added
// - Qux is added

export const Query = (...modifiers: QueryModifier[]) => {
    const interestedIn = modifiers.map(
        (modifier) => modifier.metadata.interestedIn
    );
    const persistent = modifiers.every(
        (modifier) => modifier.metadata.persistent
    );

    return {
        metadata: {
            interestedIn,
            persistent,
        },
        test: (entity: Entity) => {
            let shouldAdd = 0;
            for (const modifier of modifiers) {
                const result = modifier.test(entity);

                // If one of our modifiers says get rid, get rid
                if (result === QueryResult.Remove) return QueryResult.Remove;

                // If all of our modifiers says add, add
                shouldAdd += result === QueryResult.Add ? 1 : 0;
            }

            // If we should add, add
            if (shouldAdd === modifiers.length) return QueryResult.Add;
            return QueryResult.None;
        },
    };
};

class MySystem extends System<> {
    constructor(world: World) {
        super(world, {});
    }
}
