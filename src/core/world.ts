import { Class } from "../types/class";
import { assert } from "../utils/assert";
import { ClassMap, key } from "../utils/classmap";
import { Logger, LoggerColors } from "../utils/logger";
import { Entity } from "./entity";
import { QueryContainer, QueryManager } from "./query";
import { PureSystem, System, SystemManager, systemOrderArgs } from "./system";

declare global {
    interface Window {
        readonly GLOBAL_WORLD: World;
    }
}
// Holds resources & entities for the world
export class World {
    public readonly resources: ClassMap = new ClassMap();
    public readonly entities: Map<key, Entity> = new Map();
    private readonly logger = new Logger("world", LoggerColors.blue);
    private readonly systemManager = new SystemManager(this);
    private readonly queryManager = new QueryManager();

    constructor() {
        assert(!window.GLOBAL_WORLD, "Multiple worlds not yet supported");
        //@ts-ignore
        window.GLOBAL_WORLD = this;
    }

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
        assert(entity, "Can not remove entity that was never added");
        this.queryManager.removeEntity(entity);
        this.entities.delete("id");
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
    addSystem(
        system: System,
        order: systemOrderArgs = { index: Infinity },
        disabled = false
    ) {
        this.systemManager.addSystem(system, order, disabled);
    }

    addPureSystem(
        system: PureSystem,
        order: systemOrderArgs = { index: Infinity },
        disabled = false
    ) {
        this.systemManager.addPureSystem(system, order, disabled);
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

    //Plugin stuff
    addPlugin(plugin: (world: World) => any) {
        try {
            this.logger.group(`Added plugin "${plugin.name}"`);
            plugin(this);
            this.logger.groupEnd();
        } catch (e) {
            this.logger.error(`Error while adding plugin "${plugin.name}"`, e);
        }
    }
}
