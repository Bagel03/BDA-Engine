import { System, With } from "../../src/core/system";
import { Position } from "../components/pos";
import { Velocity } from "../components/vel";

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
        super(With("paddle"));

        document.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
        });
        document.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
        });
    }

    update() {
        this.entities.forEach((entity, name) => {
            if (this.keys[this.keysToVel[name].up]) {
                entity.get(Position).y -= 10;
            }
            if (this.keys[this.keysToVel[name].down]) {
                entity.get(Position).y += 10;
            }

            if (entity.get(Position).y < 0) {
                entity.get(Position).y = 0;
            }

            if (entity.get(Position).y > 600 - 100) {
                entity.get(Position).y = 600 - 100;
            }
        });
    }
}
