import { Matrix } from "../../../plugins/shared/math/matrix";
import { Vector } from "../../../plugins/shared/math/vector";
import { Entity } from "../../core/entity";

export enum BounceDir {
    Horizontal,
    Vertical,
    Both,
}

export class Collider {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public bounceDir: BounceDir
    ) {}

    static intersects(a: Entity, b: Entity): boolean {
        const aCollider = a.get(Collider);
        const bCollider = b.get(Collider);
        const aPos = a.get<Matrix<3, 3>>("Position").getPos();
        const bPos = b.get<Matrix<3, 3>>("Position").getPos();

        return (
            aCollider.x + aPos.x < bCollider.x + bPos.x + bCollider.width &&
            aCollider.x + aPos.x + aCollider.width > bCollider.x + bPos.x &&
            aCollider.y + aPos.y < bCollider.y + bPos.y + bCollider.height &&
            aCollider.y + aPos.y + aCollider.height > bCollider.y + bPos.y
        );
    }
}
