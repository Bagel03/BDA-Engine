import { ShapeBundle } from "../plugins/rendering2d/components/shape";
import { Renderer } from "../plugins/rendering2d/system";
import { Vector } from "../plugins/shared/math/vector";
import { World } from "../src/core/world";
import { BounceDir, Collider } from "./components/collider";
import { Bouncer } from "./systems/bouncer";
import { MovementSystem } from "./systems/movement";
import { PaddleMovement } from "./systems/paddles";

declare global {
    interface Window {
        world: World;
    }
}

const world = new World();
window.world = world;

world.addSystem(new Renderer());

world.addSystem(new PaddleMovement());
world.addSystem(new MovementSystem());
world.addSystem(new Bouncer());

// world.addSystem(new Bouncer());

const wallWidth = 10;
// Paddles
const paddleWidth = wallWidth;
const paddleHeight = 100;

const paddles = ["1", "2"].map((str, idx) =>
    world
        .spawnBundle(
            ShapeBundle(
                "rect",
                idx * 800,
                400,
                [0, 0, paddleWidth, paddleHeight],
                {
                    fillStyle: "white",
                }
            ),
            `paddle${str}`
        )
        .add(null, "Paddle")
        .add(
            new Collider(0, 0, paddleWidth, paddleHeight, BounceDir.Horizontal)
        )
);

const walls = ["top", "bottom"].map((str, idx) =>
    world
        .spawnBundle(
            ShapeBundle("rect", 0, idx * 600, [0, 0, 800, wallWidth], {
                fillStyle: "white",
            }),
            `wall${str}`
        )
        .add(new Collider(0, 0, 800, wallWidth, BounceDir.Vertical))
);

const ball = world.spawnBundle(
    ShapeBundle("arc", 400, 300, [0, 0, 10, 0, 2 * Math.PI]),
    "ball"
);

ball.add(null, "Ball");
ball.add(new Collider(-10, -10, 20, 20, BounceDir.Both));
ball.add(new Vector(3, 5), "Velocity");

const animate = () => {
    world.update("all");
    requestAnimationFrame(animate);
};

animate();
