import { ClassMap } from "../utils/classmap";
import { Class } from "../types/class";
import { Entity } from "./entity";
import { System } from "./system";
import { Logger, LoggerColors } from "../utils/logger";
import { assert } from "../utils/assert";
import { PluginManager } from "../utils/plugin_manager";
import { generateID } from "../utils/id";
import { typeID, TypeID } from "../utils/type_id";

const logger = new Logger("World", LoggerColors.blue);

// Entities, Systems, Resources, etc
export class World extends PluginManager<World> {
    public readonly systems: ClassMap = new ClassMap();
    public readonly enabledSystems: (Class<System<any>> | string)[] = [];

    private readonly entities: Map<string, Entity> = new Map();

    private readonly systemInfo: {
        added: Class<System<any>>[];
        removed: Class<System<any>>[];
        componentsToSystems: Map<TypeID, Class<System<any>>[]>;
    } = {
        added: [],
        removed: [],
        componentsToSystems: new Map(),
    };

    private readonly resources: ClassMap = new ClassMap();

    constructor() {
        super();
        logger.log("World Created");
    }

    spawn(id: string = generateID()) {
        const ent = new Entity(this, id);
        this.add(ent);
        return ent;
    }

    spawnBundle(bundle: (ent: Entity) => void, id?: string) {
        const ent = this.spawn(id);
        bundle(ent);
        return ent;
    }

    add(entity: Entity) {
        assert(
            !this.entities.has(entity.id),
            `Entity ${entity.id} already exists`
        );

        this.entities.set(entity.id, entity);

        entity.forEach((component, name) =>
            this._entityAttachComponent(
                entity,
                typeof name === "string" ? name : typeID(name)
            )
        );

        this.systemInfo.added.forEach((sys) => {
            this.systems.get(sys)._entityAdded(entity);
        });
    }

    remove(id: string) {
        assert(this.entities.has(id), `Entity ${id} does not exist`);

        const entity = this.entities.get(id)!;

        entity.forEach((component, name) => {
            this._entityRemoveComponent(
                entity,
                typeof name === "string" ? name : typeID(name)
            );
        });

        this.entities.delete(entity.id);

        this.systemInfo.removed.forEach((sys) => {
            this.systems.get(sys)._entityRemoved(entity);
        });
    }

    _entityAttachComponent(entity: Entity, componentTypeID: TypeID) {
        const systems =
            this.systemInfo.componentsToSystems.get(componentTypeID);
        this.systemInfo;
        debugger;
        if (!systems) return;

        systems.forEach((sys) => {
            this.systems.get(sys)._componentAdded(entity, componentTypeID);
        });
    }

    _entityRemoveComponent(entity: Entity, componentTypeID: TypeID) {
        const systems =
            this.systemInfo.componentsToSystems.get(componentTypeID);
        if (!systems) return;

        systems.forEach((sys) => {
            this.systems.get(sys)._componentRemoved(entity, componentTypeID);
        });
    }

    get(id: string) {
        return this.entities.get(id);
    }

    //#region System Management

    addSystem(system: System<(string | symbol)[]> | System, name?: string) {
        this.systems.set(system, name);
        this.enabledSystems.push(
            name ? name : (system.constructor as Class<System<any>>)
        );

        const { added, removed, components } = system._getQueryStats();
        if (added)
            this.systemInfo.added.push(
                system.constructor as Class<System<any>>
            );
        if (removed)
            this.systemInfo.removed.push(
                system.constructor as Class<System<any>>
            );
        if (components) {
            for (const component of components) {
                const systems =
                    this.systemInfo.componentsToSystems.get(component);
                if (!systems) {
                    this.systemInfo.componentsToSystems.set(component, [
                        system.constructor as Class<System<any>>,
                    ]);
                } else {
                    systems.push(system.constructor as Class<System<any>>);
                }
            }
        }

        logger.log(`Added system ${name ? name : system.constructor.name}`);
    }

    enableSystem(system: Class<System<any>> | string) {
        this.enabledSystems.push(system);

        logger.log(
            `Enabled system ${
                typeof system === "string" ? system : system.constructor.name
            }`
        );
    }

    disableSystem(system: Class<System<any>> | string) {
        this.enabledSystems.filter((sys) => sys !== system);

        logger.log(
            `Disabled system ${
                typeof system === "string" ? system : system.constructor.name
            }`
        );
    }

    //#endregion

    //#region Resource Management

    addResource(resource: any, name?: string) {
        this.resources.set(resource, name);
        logger.log(`Added resource ${name ? name : resource.constructor.name}`);
    }

    getResource<T>(resource: Class<T> | string) {
        return this.resources.get(resource) as T;
    }

    removeResource(resource: Class<any> | string) {
        this.resources.delete(resource);
        logger.log(
            `Removed resource ${
                typeof resource === "string" ? resource : resource.name
            }`
        );
    }

    clearResources() {
        this.resources.clear();
        logger.log("Cleared all resources");
    }

    //#endregion

    update(...systems: (Class<System<any>> | string)[] | ["all"]) {
        if (systems[0] === "all") systems = this.enabledSystems;

        systems.forEach((system) => {
            const sys = this.systems.get(system);
            assert(
                sys,
                `Can not update system "${
                    typeof system === "string" ? system : system.name
                }" does not exist`
            );

            sys._updateInternal();
        });
    }
}
