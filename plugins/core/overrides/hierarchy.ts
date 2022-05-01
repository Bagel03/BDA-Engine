import { Entity } from "../../../src/core/entity";
import { World } from "../../../src/core/world";
import "../components/relations";

declare module "../../../src/core/entity" {
    interface Entity {
        addChild(child: Entity): void;
        removeChild(id: string): void;
    }
}
export const LoadHierarchy = (world: World) => {
    Entity.override("addChild", function (this: Entity, child: Entity) {
        if (this.hasRelation("children")) {
            const children = this.getRelation("children");
            children.set(child.id, child);
        }

        child.addRelation("parent", this);
    });

    Entity.override("removeChild", function (this: Entity, id: string) {
        this.getRelation("children").get(id)?.removeRelation("parent");

        if (this.hasRelation("children")) {
            const children = this.getRelation("children");
            children.delete(id);
        }
    });
};
