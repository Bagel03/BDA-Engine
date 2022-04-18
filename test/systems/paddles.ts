import { Matrix } from "../../plugins/shared/math/matrix";
import { Vector } from "../../plugins/shared/math/vector";
import { System, With } from "../../src/core/system";

export class PaddleMovement extends System {
    public keys: { [key: string]: boolean } = {};
    private keysToVel = {
        paddle2: {
            up: "ArrowUp",
            down: "ArrowDown",
        },
        paddle1: {
            up: "w",
            down: "s",
        },
    };

    constructor() {
        super(With("Paddle"));

        document.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
        });
        document.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
        });
    }

    update() {
        this.entities.forEach((entity, name) => {
            const transform = entity.get<Matrix<3, 3>>("Position");
            const translation = new Vector(0, 0);

            if (this.keys[this.keysToVel[name].up]) {
                translation.y -= 10;
            }
            if (this.keys[this.keysToVel[name].down]) {
                translation.y += 10;
            }

            transform.translate(translation);

            if (transform.getPos().y < 0) {
                transform.setPos(new Vector(transform.getPos().x, 0));
            }

            if (transform.getPos().y > 500) {
                transform.setPos(new Vector(transform.getPos().x, 500));
            }
        });
    }
}
