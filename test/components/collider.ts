import { Entity } from "../../src/core/entity";
import { Position } from "./pos";

export enum BounceDir {
    Horizontal,
    Vertical,
}

export class Collider {
    constructor(
        public width: number,
        public height: number,
        public bounceDir: BounceDir
    ) {}

    static intersects(a: Entity, b: Entity): boolean {
        const aCollider = a.get(Collider);
        const bCollider = b.get(Collider);
        const aPos = a.get(Position);
        const bPos = b.get(Position);

        return !(
            aPos.x < bPos.x + bCollider.width &&
            aPos.x + aCollider.width > bPos.x &&
            aPos.y < bPos.y + bCollider.height &&
            aPos.y + aCollider.height > bPos.y
        );
    }
}
