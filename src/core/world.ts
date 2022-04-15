import { ClassMap, NamedClassMap } from "../utils/classmap";
import { Class } from "../types/class";
import { Entity } from "./entity";
import { System } from "./system";
import { Logger, LoggerColors } from "../utils/logger";
import { assert } from "../utils/assert";
import { WithOnlyType } from "../types/with";
import { ObjectPool } from "./object_pool";
import { mixin } from "../utils/mixin";
import { PluginManager } from "../utils/plugin_manager";
import { generateID } from "../utils/id";

type WorldMethods = WithOnlyType<World, (...args: any[]) => any>;

const logger = new Logger("World", LoggerColors.blue);

// Entities, Systems, Resources, etc
export class World extends mixin(PluginManager, NamedClassMap("resource")) {
    public readonly systems: ClassMap = new ClassMap();
    private readonly entities: Map<string, Entity> = new Map();
    public readonly enabledSystems: (Class<System<any>> | string)[] = [];
    private readonly pool: ObjectPool = new ObjectPool();

    private readonly systemInfo: {
        added: Class<System<any>>[];
        removed: Class<System<any>>[];
        componentsToSystems: Map<Class, Class<System<any>>[]>;
    } = {
        added: [],
        removed: [],
        componentsToSystems: new Map(),
    };

    constructor() {
        super();

        // Dirty hack because mixin can't be used with super
        this.resourceClassMap = new ClassMap();

        logger.log("World Created");
    }

    spawn(id: string = generateID()) {
        const ent = this.pool.new(Entity, this, id);
        this.add(ent);
        return ent;
    }

    add(entity: Entity) {
        assert(
            !this.entities.has(entity.id),
            `Entity ${entity.id} already exists`
        );

        this.entities.set(entity.id, entity);

        entity.componentClassMap.forEach((component) =>
            this.entityAttachComponent(entity, component.constructor)
        );

        this.systemInfo.added.forEach((sys) => {
            this.systems.get(sys).entityAdded(entity);
        });
    }

    remove(entity: Entity) {
        assert(
            this.entities.has(entity.id),
            `Entity ${entity.id} does not exist`
        );

        entity.componentClassMap.forEach((component, name) => {
            this.entityRemoveComponent(entity, component.constructor);
        });

        this.entities.delete(entity.id);

        this.systemInfo.removed.forEach((sys) => {
            this.systems.get(sys).entityRemoved(entity);
        });
    }

    //[package] private
    entityAttachComponent(entity: Entity, component: Class) {
        const systems = this.systemInfo.componentsToSystems.get(component);
        if (!systems) return;

        systems.forEach((sys) => {
            this.systems.get(sys).componentAdded(entity, component);
        });
    }

    //[package] private
    entityRemoveComponent(entity: Entity, component: Class) {
        const systems = this.systemInfo.componentsToSystems.get(component);
        if (!systems) return;

        systems.forEach((sys) => {
            this.systems.get(sys).componentRemoved(entity, component);
        });
    }

    get(id: string) {
        return this.entities.get(id);
    }

    addSystem(system: System<any>, name?: string) {
        this.systems.set(system, name);
        this.enabledSystems.push(
            name ? name : (system.constructor as Class<System<any>>)
        );

        const { added, removed, components } = system.getQueryStats();
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

    update(systems: (Class<System<any>> | string)[] | "all", ...args: any[]) {
        if (systems === "all") systems = this.enabledSystems;

        systems.forEach((system) => {
            const sys = this.systems.get(system);
            assert(
                sys,
                `Can not update system "${
                    typeof system === "string" ? system : system.name
                }" does not exist`
            );

            sys.update(...args);
        });
    }

    // static overloads: string[] = [];

    // static addMethod<N extends keyof WorldMethods, M extends World[N]>(
    //     name: N,
    //     method: (this: World, ...args: Parameters<M>) => ReturnType<M>
    // ) {
    //     assert(
    //         !this.overloads.includes(name),
    //         `Tried to add a world method twice`
    //     );

    //     (this.prototype[name] as M) = method as M;
    //     this.overloads.push(name);
    //     logger.log(`Added method ${name} to World`);
    // }
}
