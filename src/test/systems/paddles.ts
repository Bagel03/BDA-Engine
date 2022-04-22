import { WorldSettings } from "../index";
import { Matrix } from "../../../plugins/shared/math/matrix";
import { Vector } from "../../../plugins/shared/math/vector";
import { System, With } from "../../core/system";

export class PaddleMovement extends System {
    public keys: { [key: string]: boolean } = {};
    private keysToVel = {
        "1": {
            up: "w",
            down: "s",
        },
        "2": {
            up: "ArrowUp",
            down: "ArrowDown",
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
        const settings = this.world!.getResource(WorldSettings);

        this.entities.forEach((entity) => {
            const transform = entity.get<Matrix<3, 3>>("Position");
            const translation = new Vector(0, 0);

            if (this.keys[this.keysToVel[entity.get<string>("Paddle")].up]) {
                translation.y -= 10;
            }
            if (this.keys[this.keysToVel[entity.get<string>("Paddle")].down]) {
                translation.y += 10;
            }

            transform.translate(translation);

            if (transform.getPos().y < settings.paddleWidth) {
                transform.setPos(
                    new Vector(transform.getPos().x, settings.paddleWidth)
                );
            }

            if (
                transform.getPos().y >
                settings.worldHeight -
                    settings.paddleWidth -
                    settings.paddleHeight
            ) {
                transform.setPos(
                    new Vector(
                        transform.getPos().x,
                        settings.worldHeight -
                            settings.paddleWidth -
                            settings.paddleHeight
                    )
                );
            }
        });
    }
}
