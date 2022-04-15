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

interface Query {
    metadata: QueryMetadata;
    test: (entity: Entity) => QueryResult;
}

export abstract class System<Q extends Record<string, Query>> {
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

                if (result === QueryResult.Remove) {
                    return this.entities[query].delete(entity.id);
                }

                if (result === QueryResult.Add) {
                    return this.entities[query].set(entity.id, entity);
                }
            }
        }
    }

    getQueryStats() {
        return {
            added: this.addedQueries.length > 0,
            removed: this.removedQueries.length > 0,
            components: this.componentsToQueries.keys(),
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
            Query
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
                if (!entity.hasComponent(component)) return QueryResult.None;
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
                if (entity.hasComponent(component)) return QueryResult.None;
            }
            return QueryResult.Remove;
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
