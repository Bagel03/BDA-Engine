import { Vector } from "../../../plugins/shared/math/vector";
import { System, With } from "../../core/system";
import { BounceDir, Collider } from "../components/collider";

export class Bouncer extends System<["ball", "static"]> {
    constructor() {
        super({
            ball: With("Ball"),
            static: With(Collider),
        });
    }

    update() {
        this.entities.ball.forEach((ball) => {
            this.entities.static.forEach((staticEntity) => {
                if (staticEntity === ball) return;

                if (Collider.intersects(ball, staticEntity)) {
                    if (
                        staticEntity.get(Collider).bounceDir ===
                        BounceDir.Horizontal
                    ) {
                        ball.get<Vector<2>>("Velocity").x *= -1;
                    } else {
                        ball.get<Vector<2>>("Velocity").y *= -1;
                    }
                }
            });
        });
    }
}
