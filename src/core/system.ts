import { defaultSystemType } from "../config/symbols";
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

export abstract class System<Q extends Record<string, QueryModifier>> {
    protected readonly entities: {
        [id in keyof Q]: Map<string, Entity>;
    };

    private readonly addedQueries: (keyof Q)[] = [];
    private readonly removedQueries: (keyof Q)[] = [];
    private readonly componentsToQueries: Map<Class, (keyof Q)[]> = new Map();
    private readonly queriesToClear: (keyof Q)[] = [];

    // For use by world only
    entityAdded(entity: Entity) {
        this.addedQueries.forEach((query) => {
            const result = this.queries[query].test(entity);
            if (result === QueryResult.None) return;

            if (result === QueryResult.Add) {
                return this.entities[query].set(entity.id, entity);
            }

            if (result === QueryResult.Remove) {
                return this.entities[query].delete(entity.id);
            }
        });
    }

    entityRemoved(entity: Entity) {
        this.removedQueries.forEach((query) => {
            const result = this.queries[query].test(entity);
            if (result === QueryResult.None) return;

            if (result === QueryResult.Remove) {
                return this.entities[query].delete(entity.id);
            }

            if (result === QueryResult.Add) {
                return this.entities[query].set(entity.id, entity);
            }
        });
    }

    componentAdded(entity: Entity, component: Class) {
        const queries = this.componentsToQueries.get(component);
        if (queries) {
            for (const query of queries) {
                const result = this.queries[query].test(entity);
                if (result === QueryResult.None) return;

                if (result === QueryResult.Add) {
                    return this.entities[query].set(entity.id, entity);
                }

                if (result === QueryResult.Remove) {
                    return this.entities[query].delete(entity.id);
                }
            }
        }
    }

    componentRemoved(entity: Entity, component: Class) {
        const queries = this.componentsToQueries.get(component);
        if (queries) {
            for (const query of queries) {
                const result = this.queries[query].test(entity);
                if (result === QueryResult.None) return;

                if (result === QueryResult.Add) {
                    return this.entities[query].delete(entity.id);
                }

                if (result === QueryResult.Remove) {
                    return this.entities[query].set(entity.id, entity);
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

    getTypes(): Symbol[] {
        return [defaultSystemType];
    }

    constructor(public readonly world: World, private readonly queries: Q) {
        // Set it up
        this.entities = {} as any;
        for (const [key, query] of Object.entries(queries) as [
            keyof Q,
            QueryModifier
        ][]) {
            this.entities[key] = new Map();
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
            this.entities[query].clear();
        });
    }

    update(...args: any[]) {}

    static new<T extends Record<string, QueryModifier>>(
        world: World,
        queries: T
    ): System<T> {
        return new (this as any)(world, queries);
    }
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
                if (!entity.hasComponent(component)) return QueryResult.Remove;
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
                if (entity.hasComponent(component)) return QueryResult.Remove;
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
                if (!entity.hasComponent(component)) return QueryResult.Add;
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
