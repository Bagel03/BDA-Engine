import { System, With } from "../../src/core/system";
import { BounceDir, Collider } from "../components/collider";
import { Velocity } from "../components/vel";

export class Bouncer extends System<["ball", "static"]> {
    constructor() {
        super({
            ball: With("ball"),
            static: With(Collider),
        });
    }

    update() {
        this.entities.ball.forEach((ball) => {
            this.entities.static.forEach((staticEntity) => {
                if (Collider.intersects(ball, staticEntity)) {
                    if (
                        staticEntity.get(Collider).bounceDir ===
                        BounceDir.Horizontal
                    ) {
                        ball.get(Velocity).x *= -1;
                    } else {
                        ball.get(Velocity).y *= -1;
                    }
                }
            });
        });
    }
}
