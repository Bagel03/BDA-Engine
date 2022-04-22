import { defaultSymbol } from "../config/symbols";
import { Class } from "../types/class";
import { assert } from "../utils/assert";
import { key } from "../utils/classmap";
import { typeID, TypeID } from "../utils/type_id";
import { Entity } from "./entity";
import { World } from "./world";

enum EntityEvent {
    Added,
    Removed,
}

interface QueryMetadata {
    interestedIn: (EntityEvent | TypeID)[];
    persistent: boolean;
}

enum QueryResult {
    Add,
    Remove,
    None,
}

class QueryModifier {
    constructor(
        public metadata: QueryMetadata,
        public test: (entity: Entity) => QueryResult
    ) {}
}

export abstract class System<T extends key[] = [typeof defaultSymbol]> {
    private readonly queriesToEntities: {
        [id in T[number]]: Map<string, Entity>;
    };

    private readonly queries: Record<T[number], QueryModifier>;

    private readonly addedQueries: T[number][] = [];
    private readonly removedQueries: T[number][] = [];
    private readonly componentsToQueries: Map<key, T[number][]> = new Map();

    private readonly queriesToClear: T[number][] = [];

    protected readonly world?: World;

    protected get entities(): T extends [typeof defaultSymbol] // See if there is not more than one query
        ? Map<string, Entity>
        : {
              [id in T[number]]: Map<string, Entity>;
          } {
        if ((this.queries as { [defaultSymbol]?: any })[defaultSymbol]) {
            //@ts-ignore
            return this.queriesToEntities[defaultSymbol];
        } else {
            //@ts-ignore
            return this.queriesToEntities;
        }
    }

    // For use by world only
    _entityAdded(entity: Entity) {
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

    _entityRemoved(entity: Entity) {
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

    _componentAdded(entity: Entity, componentTypeID: key) {
        const queries = this.componentsToQueries.get(componentTypeID);
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

    _componentRemoved(entity: Entity, componentTypeID: key) {
        const queries = this.componentsToQueries.get(componentTypeID);
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

    _getQueryStats() {
        return {
            added: this.addedQueries.length > 0,
            removed: this.removedQueries.length > 0,
            components: Array.from(this.componentsToQueries.keys()),
        };
    }

    constructor(
        queries: T extends [typeof defaultSymbol]
            ? QueryModifier
            : Record<T[number], QueryModifier>
    ) {
        // This is type safe, ts will not allow this to be done
        this.queries =
            queries instanceof QueryModifier
                ? //@ts-ignore
                  { [defaultSymbol]: queries }
                : queries;

        // Set it up
        this.queriesToEntities = {} as any;

        // Go through each query and update our internal data structures
        for (const key of Reflect.ownKeys(this.queries) as T[number][]) {
            const query = this.queries[key];
            this.queriesToEntities[key] = new Map();
            // If it is "Added" or "Removed" then we need to add it to the list of queries to clear after each frame
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

    _updateInternal() {
        assert(this.world, "System must be added to a world to update");
        this.update();
        this.queriesToClear.forEach((query) => {
            this.queriesToEntities[query].clear();
        });
    }

    protected update() {}
    onEnabled() {}
    protected onDisabled(this: System<T> & { world: World }) {}
}

// Different Query implementations
export const With = (...components: (Class | string)[]) => {
    return new QueryModifier(
        {
            interestedIn: components.map((component) =>
                typeof component === "string" ? component : typeID(component)
            ),
            persistent: true,
        },
        (entity: Entity) => {
            for (const component of components) {
                if (!entity.has(component)) return QueryResult.Remove;
            }
            return QueryResult.Add;
        }
    );
};

export const Without = (...components: Class[]) => {
    return new QueryModifier(
        {
            interestedIn: components.map((component) =>
                typeof component === "string" ? component : typeID(component)
            ),
            persistent: false,
        },
        (entity: Entity) => {
            for (const component of components) {
                if (entity.has(component)) return QueryResult.Remove;
            }
            return QueryResult.Add;
        }
    );
};

export const WithAdded = (...components: Class[]) => {
    return new QueryModifier(
        {
            interestedIn: components.map((component) =>
                typeof component === "string" ? component : typeID(component)
            ),
            persistent: false,
        },
        (entity: Entity) => {
            for (const component of components) {
                if (!entity.has(component)) return QueryResult.Add;
            }
            return QueryResult.None;
        }
    );
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
