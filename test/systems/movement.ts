import { System, With } from "../../src/core/system";
import { World } from "../../src/core/world";
import { Position } from "../components/pos";
import { Velocity } from "../components/vel";

export class MovementSystem extends System {
    constructor() {
        super(With(Velocity, Position));
    }

    update() {
        this.entities.forEach((entity) => {
            const pos = entity.get(Position);
            const vel = entity.get(Velocity);

            pos.x += vel.x;
            pos.y += vel.y;
        });
    }
}
