import { assert } from "../exports";
import { key } from "../utils/classmap";
import { Logger, LoggerColors } from "../utils/logger";
import { Entity } from "./entity";
import { FastQuery, Query } from "./query";
import { World } from "./world";

export const Res = null,
    Ent = null;
export type Res<T, N extends key = string> = T;
export type Ent<N extends key = string> = Res<Entity, N>;

type systemPram = Res<any, key> | Ent<key> | Query<any[]> | FastQuery | World;

export type System = (...prams: systemPram[]) => any;
export type PureSystem = (world: World, setup?: boolean) => any;

declare global {
    interface Function {
        queryIds: number[];
    }
}

// https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object
    ? (Without<T, U> & U) | (Without<U, T> & T)
    : T | U;

export type systemOrderArgs = XOR<
    { index: number },
    XOR<{ before: System }, { after: System }>
>;

export class SystemManager {
    private readonly systems: PureSystem[] = [];
    private readonly disabledSystems: Set<System> = new Set();
    private readonly logger = new Logger("Systems", LoggerColors.purple);
    constructor(public readonly world: World) {}

    private insertSys(
        system: PureSystem,
        order: systemOrderArgs = { index: Infinity },
        disabled = false
    ) {
        let idx: number;
        if (order.index) idx = order.index;
        else if (order.before) {
            const beforeIdx = this.systems.indexOf(order.before);
            assert(
                beforeIdx > -1,
                `Can not insert system "${system.name}" before "${order.before.name}", because the latter is not present`
            );
            idx = beforeIdx;
        } else {
            const afterIdx = this.systems.indexOf(order.after!);
            assert(
                afterIdx > -1,
                `Can not insert system "${system.name}" before "${
                    order.after!.name
                }", because the latter is not present`
            );
            idx = afterIdx + 1;
        }

        this.systems.splice(idx, 0, system);

        if (disabled) {
            this.disabledSystems.add(system);
        }
    }

    addPureSystem(
        system: PureSystem,
        order: systemOrderArgs = { index: Infinity },
        disabled = false
    ) {
        system(this.world, true);
        this.insertSys(system, order, disabled);
        this.logger.info(`Added system ${system.name}`);
    }

    addSystem(
        system: System,
        order: systemOrderArgs = { index: Infinity },
        disabled = false
    ) {
        // DANGER ZONE
        // Check if the compiler has edited this one (it was marked with @system)
        // @ts-ignore
        if (system(this.world, true) !== "__system__") {
            this.logger.error(
                `Refusing to add a system that was not marked with the "@system" tag`
            );
            return;
        }

        this.insertSys(system, order, disabled);
        this.logger.info(`Added system ${system.name}`);
    }

    enableSystem(system: System) {
        assert(
            this.systems.includes(system),
            `Can not enable system ${system.name}, it was never added`
        );
        const del = this.disabledSystems.delete(system);
        if (!del)
            this.logger.warn(
                `Could not enable system ${system.name}, it was never disabled`
            );
        else this.logger.log(`Enabled system ${system.name} `);
    }

    disableSystem(system: System) {
        assert(
            this.systems.includes(system),
            `Can not disable system ${system.name}, it was never added`
        );
        const add = this.disabledSystems.add(system);
        if (!add)
            this.logger.warn(
                `Could not disable system ${system.name}, it was already disabled`
            );
        else this.logger.log(`Disabled system ${system.name}`);
    }

    update(...systems: System[]) {
        if (systems.length === 0) systems = this.systems;
        systems.forEach((sys) => {
            if (!this.disabledSystems.has(sys)) {
                sys(this.world, false);
            }
        });
    }

    updateComplex(fn: (system: System) => boolean, disabled = false) {
        this.systems.forEach((system) => {
            if (
                (!disabled || !this.disabledSystems.has(system)) && // If we are not filtering out disabled, its good
                fn(system)
            ) {
                system(this.world, false);
            }
        });
    }
}
