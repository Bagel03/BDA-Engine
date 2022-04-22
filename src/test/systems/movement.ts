import { Matrix } from "../../../plugins/shared/math/matrix";
import { Vector } from "../../../plugins/shared/math/vector";
import { System, With } from "../../core/system";

export class MovementSystem extends System {
    constructor() {
        super(With("Velocity", "Position"));
    }

    update() {
        this.entities.forEach((entity) => {
            const pos = entity.get<Matrix<3, 3>>("Position");
            const vel = entity.get<Vector<2>>("Velocity");
            pos.translate(vel);
        });
    }
}
