import { ClassMap } from "../utils/classmap";
import { Class } from "../types/class";
import { Entity } from "./entity";
import { System } from "./system";
import { Logger, LoggerColors } from "../utils/logger";
import { assert } from "../utils/assert";
import { WithOnlyType } from "../types/with";
import { mixin } from "../utils/mixin";
import { PluginManager } from "../utils/plugin_manager";
import { generateID } from "../utils/id";

const logger = new Logger("World", LoggerColors.blue);

// Entities, Systems, Resources, etc
export class World extends PluginManager {
    public readonly systems: ClassMap = new ClassMap();
    private readonly entities: Map<string, Entity> = new Map();
    public readonly enabledSystems: (Class<System<any>> | string)[] = [];

    private readonly systemInfo: {
        added: Class<System<any>>[];
        removed: Class<System<any>>[];
        componentsToSystems: Map<Class | string, Class<System<any>>[]>;
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

    private add(entity: Entity) {
        assert(
            !this.entities.has(entity.id),
            `Entity ${entity.id} already exists`
        );

        this.entities.set(entity.id, entity);

        entity.forEach((component, name) =>
            this.entityAttachComponent(entity, name)
        );

        this.systemInfo.added.forEach((sys) => {
            this.systems.get(sys).entityAdded(entity);
        });
    }

    remove(id: string) {
        assert(this.entities.has(id), `Entity ${id} does not exist`);

        const entity = this.entities.get(id)!;

        entity.forEach((component, name) => {
            this.entityRemoveComponent(entity, name);
        });

        this.entities.delete(entity.id);

        this.systemInfo.removed.forEach((sys) => {
            this.systems.get(sys).entityRemoved(entity);
        });
    }

    private entityAttachComponent(entity: Entity, component: Class | string) {
        const systems = this.systemInfo.componentsToSystems.get(component);
        if (!systems) return;

        systems.forEach((sys) => {
            this.systems.get(sys).componentAdded(entity, component);
        });
    }

    private entityRemoveComponent(entity: Entity, component: Class | string) {
        const systems = this.systemInfo.componentsToSystems.get(component);
        if (!systems) return;

        systems.forEach((sys) => {
            this.systems.get(sys).componentRemoved(entity, component);
        });
    }

    get(id: string) {
        return this.entities.get(id);
    }

    //#region System Management

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

        console.log(this.systemInfo);

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

    getResource(resource: Class<any> | string) {
        return this.resources.get(resource);
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

    update(systems: (Class<System<any>> | string)[] | "all") {
        if (systems === "all") systems = this.enabledSystems;

        systems.forEach((system) => {
            const sys = this.systems.get(system);
            assert(
                sys,
                `Can not update system "${
                    typeof system === "string" ? system : system.name
                }" does not exist`
            );

            sys.update();
        });
    }
}
