import { textChangeRangeIsUnchanged } from "typescript";
import { key } from "../utils/classmap";
import { Logger, LoggerColors } from "../utils/logger";
import { Entity } from "./entity";
import { FastQuery, Query } from "./query";
import { World } from "./world";

// TODO: Make this not hacky
type Res<T, N extends key = "__none__"> = T;
type Ent<N extends key = "__none__"> = Res<Entity, N>;

type systemPram = Res<any, key> | Ent<key> | Query<any[]> | FastQuery | World;

export type System = (...prams: systemPram[]) => any;
export type PureSystem = (world: World, setup?: boolean) => any;

declare global {
    interface Function {
        queryIds: number[];
    }
}

export class SystemManager {
    private readonly systems: Set<PureSystem>;
    private readonly enabledSystems: System[];
    private readonly logger = new Logger(LoggerColors.purple);
    constructor(public readonly world: World) {}

    addPureSystem(system: PureSystem, enabled = true) {
        this.systems.add(system);
        if (enabled) this.enabledSystems.push(system);
        system(this.world, true);
        this.logger.info(`Added system ${system.name}`);
    }

    addSystem(system: System, enabled = true) {
        // DANGER ZONE
        // Check if the compiler has edited this one (it was marked with @system)
        // @ts-ignore
        if (system(this.world, true) === "__system__") {
            this.logger.error(
                `Refusing to add a system that was not marked with the "@system" tag`
            );
            return;
        }

        this.systems.add(system);
        if (enabled) this.enabledSystems.push(system);
        this.logger.info(`Added system ${system.name}`);
    }

    enableSystem(system: System) {
        this.enabledSystems.push(system);
        this.logger.log(`Enabled ${system.name} system`);
    }

    disableSystem(system: System) {
        const index = this.enabledSystems.indexOf(system);
        if (index === -1)
            return this.logger.log(
                "Can not disable system that was never enabled"
            );
        this.enabledSystems.splice(index, 1);
        this.logger.log(`Disabled ${system.name} system`);
    }

    update(...systems: System[]) {
        if (!systems) systems = this.enabledSystems;
        systems.forEach((sys) => sys(this.world, false));
    }

    updateComplex(fn: (system: System) => boolean, disabled = false) {
        if (disabled) {
            this.systems.forEach((system) => {
                if (fn(system)) {
                    system(this.world, false);
                }
            });
        } else {
            this.enabledSystems.forEach((system) => {
                if (fn(system)) {
                    system(this.world, false);
                }
            });
        }
    }
}
