import { Class } from "../types/class";
import { ClassMap, key } from "../utils/classmap";
import { Logger, LoggerColors } from "../utils/logger";
import { Entity } from "./entity";
import { QueryContainer, QueryEvents, QueryManager } from "./query";
import { System, SystemManager } from "./system";

// Holds resources & entities for the world
export class World {
    public readonly resources: ClassMap = new ClassMap();
    public readonly entities: Map<key, Entity> = new Map();
    private readonly logger = new Logger("world", LoggerColors.blue);
    private readonly systemManager = new SystemManager(this);
    private readonly queryManager = new QueryManager();

    // Entity Stuff
    addEntity(entity: Entity) {
        if (this.entities.has(entity.id)) {
            this.logger.warn(`Added entity with ID ${String(entity.id)} twice`);
        }
        this.entities.set(entity.id, entity);
        entity.world = this;

        this.queryManager.addEntity(entity);
    }

    removeEntity(id: key) {
        const entity = this.entities.get(id);
        if (!entity) {
            this.logger.warn(`Can not remove entity `);
        }
    }

    getEntity(id: key) {
        return this.entities.get(id);
    }

    // Resource stuff
    addRes(res: any, key?: key) {
        this.resources.add(res, key);
    }

    removeRes(key: Class | key) {
        if (!this.resources.delete(key)) {
            this.logger.warn(
                `Can not remove resource ${String(
                    key
                )} because it was never added`
            );
        }
    }

    getRes<T>(key: key | Class<T>) {
        return this.resources.get<T>(key);
    }

    // System stuff
    addSystem(system: System, enabled = true) {
        this.systemManager.addSystem(system, enabled);
    }

    addPureSystem(system: System, enabled = true) {
        this.systemManager.addPureSystem(system, enabled);
    }

    enableSystem(system: System) {
        this.systemManager.enableSystem(system);
    }

    disableSystem(system: System) {
        this.systemManager.disableSystem(system);
    }

    update(...systems: System[]) {
        this.systemManager.update(...systems);
    }
    updateComplex(fn: (system: System) => boolean, disabled = false) {
        this.systemManager.updateComplex(fn, disabled);
    }
    // Query stuff
    addQuery(query: QueryContainer, id: string) {
        this.queryManager.add(query, id);
        this.entities.forEach((ent) => query.check(ent));
    }

    removeQuery(queryID: string) {
        this.queryManager.remove(queryID);
    }

    getQuery(queryID: string) {
        return this.queryManager.get(queryID);
    }

    /** @internal */
    queryEvent(entity: Entity, event: key) {
        this.queryManager.event(event, entity);
    }
}
