import { key, keyify } from "../utils/classmap";
import { Entity } from "./entity";
import { Class } from "../types/class";
import { assert } from "../exports";

//#region Query impls
export abstract class QueryContainer {
    protected readonly entities: Set<Entity> = new Set();
    public readonly interestedEvents: Set<key> = new Set();

    constructor(protected checker: (entity: Entity) => boolean) {}

    check(entity: Entity) {
        if (this.checker(entity)) {
            this.entities.add(entity);
        } else {
            this.entities.delete(entity);
        }
    }

    // Useful for when entity is removed from the world
    remove(entity: Entity) {
        this.entities.delete(entity);
    }
}

interface IterableQuery extends QueryContainer {
    [Symbol.iterator](): IterableIterator<any>;
}

export class FastQuery extends QueryContainer implements IterableQuery {
    [Symbol.iterator](): IterableIterator<Entity> {
        return this.entities.values();
    }
}

// Export the type as well as null so that importing works both at compile time and runtime
export type QueryModifier = [(ent: Entity) => boolean, key[]?];
export const QueryModifier = null;

type extractTypes<T extends any[]> = {
    [I in keyof T]: T[I] extends [any, key] ? T[I][0] : T[I];
};

export class Query<C extends any[], M extends QueryModifier = [() => true]>
    extends QueryContainer
    implements IterableQuery
{
    private readonly types: key[];

    constructor(
        types: (key | Class)[],
        checker: QueryModifier = [(ent: Entity) => true]
    ) {
        super(
            (ent) =>
                this.types.every((comp) => ent.has(comp)) && checker[0](ent)
        );

        checker[1] && checker[1].forEach(this.interestedEvents.add);

        this.types = types.map(keyify);
    }

    *[Symbol.iterator](): IterableIterator<[...extractTypes<C>, Entity]> {
        for (const entity of this.entities.values()) {
            yield [...(this.types.map(entity.get, entity) as C), entity];
        }
    }

    single(): Entity {
        assert(
            this.entities.size === 1,
            `Query.single() called on query with ${this.entities.size} targets`
        );
        return Array.from(this.entities)[0];
    }
}
//#endregion

//#region query manager
export class QueryManager {
    private readonly queries: Map<string, QueryContainer> = new Map();
    private readonly eventsToQueries: Map<key, Set<string>> = new Map();

    add(query: QueryContainer, id: string) {
        this.queries.set(id, query);
        for (const event of query.interestedEvents) {
            if (!this.eventsToQueries.has(event)) {
                this.eventsToQueries.set(event, new Set());
            }
            this.eventsToQueries.get(event)!.add(id);
        }
    }

    get(queryID: string) {
        return this.queries.get(queryID);
    }

    remove(queryID: string) {
        const query = this.queries.get(queryID);
        if (query) {
            for (const event of query.interestedEvents) {
                this.eventsToQueries.get(event)!.delete(queryID);
            }
        }
        this.queries.delete(queryID);
    }

    clear() {
        this.queries.clear();
        this.eventsToQueries.clear();
    }

    event(event: key, entity: Entity) {
        if (this.eventsToQueries.has(event)) {
            for (const queryID of this.eventsToQueries.get(event)!) {
                this.queries.get(queryID)!.check(entity);
            }
        }
    }

    removeEntity(entity: Entity) {
        this.queries.forEach((query) => query.remove(entity));
    }

    addEntity(entity: Entity) {
        this.queries.forEach((query) => query.check(entity));
    }
}
//#endregion
