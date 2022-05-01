import { Entity } from "../../../src/core/entity";
import { World } from "../../../src/core/world";
import { assert } from "../../../src/utils/assert";
import { key } from "../../../src/utils/classmap";

const relationsSymbol = Symbol("relations");

declare module "../../../src/core/entity" {
    export interface ComponentNames {
        [relationsSymbol]: Map<key, Map<string, Entity>>;
    }

    export interface Entity {
        addRelation(name: key, target: Entity): void;
        getRelation(name: key): Map<string, Entity>;
        getRelation(name: key, single: true): Entity;
        removeRelation(name: key, targetID: string): void;
        removeRelation(name: key): void;
        hasRelation(name: key): boolean;
    }
}

export const LoadRelations = (world: World) => {
    Entity.override("addRelation", function (this: Entity, name, target) {
        if (this.has(relationsSymbol)) {
            const relations = this.get(relationsSymbol);

            if (!relations.has(name)) {
                relations.set(name, new Map());
            }

            relations.get(name)?.set(target.id, target);
        } else {
            this.add(new Map([[target.id, target]]), relationsSymbol);
        }
    });

    Entity.override(
        "getRelation",
        function (this: Entity, name, single = false) {
            assert(this.has(relationsSymbol), "Entity has no relations");
            const relations = this.get(relationsSymbol);
            const relation = relations.get(name);

            if (single) {
                return relation?.values().next().value;
            } else {
                return relation;
            }
        }
    );

    Entity.override(
        "removeRelation",
        function (this: Entity, name, targetID?: string) {
            assert(this.has(relationsSymbol), "Entity has no relations");
            const relations = this.get(relationsSymbol);
            if (targetID === undefined) {
                relations.delete(name);
            }

            const relation = relations.get(name);
            relation?.delete(targetID!);
        }
    );
};
