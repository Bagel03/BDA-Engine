import { key, keyify } from "../utils/classmap";
import { Entity } from "./entity";
import { Class } from "../types/class";

/** @symbol */
export enum QueryEvents {
    Added,
    Removed,
}

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

type extractTypes<T extends any[]> = {
    [I in keyof T]: T[I] extends [any, key] ? T[I][0] : T[I];
};

class Foo {
    number: number = 5;
}

class Bar {
    str: string = "5";
}

type a = extractTypes<[Foo, [Bar, "bar"]]>;

export class Query<T extends any[]>
    extends QueryContainer
    implements IterableQuery
{
    private readonly types: key[];

    constructor(
        types: (key | Class)[],
        checker: (entity: Entity) => boolean = (ent) => true
    ) {
        super(
            (ent) => this.types.every((comp) => ent.has(comp)) && checker(ent)
        );
        this.types = types.map(keyify);
    }

    *[Symbol.iterator](): IterableIterator<[...T, Entity]> {
        for (const entity of this.entities.values()) {
            yield [...(this.types.map(entity.get, entity) as T), entity];
        }
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
