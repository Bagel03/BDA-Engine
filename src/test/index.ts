import { ShapeBundle } from "../../plugins/rendering/2d/components/shape";
import { Renderer } from "../../plugins/rendering2d/system";
import { Vector } from "../../plugins/shared/math/vector";
import { World } from "../core/world";
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

export class WorldSettings {
    public readonly worldWidth = 800;
    public readonly worldHeight = 600;
    public readonly ballRadius = 10;
    public readonly paddleHeight = 100;
    public readonly paddleWidth = 20;
    public readonly paddleSpeed = 10;
    public readonly paddleBounce = 0.5;
    public readonly ballSpeed = 5;
}
const settings = new WorldSettings();

world.addResource(settings);

const paddles = ["1", "2"].map((str, idx) =>
    world
        .spawnBundle(
            ShapeBundle(
                "rect",
                idx * (settings.worldWidth - settings.paddleWidth),
                settings.worldHeight / 2 - settings.paddleHeight / 2,
                [0, 0, settings.paddleWidth, settings.paddleHeight],
                {
                    fillStyle: "white",
                }
            )
        )
        .add(str, "Paddle")
        .add(
            new Collider(
                0,
                0,
                settings.paddleWidth,
                settings.paddleHeight,
                BounceDir.Horizontal
            )
        )
);

const walls = ["top", "bottom"].map((str, idx) =>
    world
        .spawnBundle(
            ShapeBundle(
                "rect",
                0,
                idx * (settings.worldHeight - settings.paddleWidth),
                [0, 0, 800, settings.paddleWidth],
                {
                    fillStyle: "white",
                }
            )
        )
        .add(
            new Collider(
                0,
                0,
                settings.worldWidth,
                settings.paddleWidth,
                BounceDir.Vertical
            )
        )
);

const ball = world
    .spawnBundle(
        ShapeBundle(
            "arc",
            settings.worldWidth / 2,
            settings.worldHeight / 2,
            [0, 0, settings.ballRadius, 0, 2 * Math.PI],
            { fillStyle: "white" }
        )
    )
    .tag("Ball")
    .add(
        new Collider(
            -settings.ballRadius,
            -settings.ballRadius,
            settings.ballRadius * 2,
            settings.ballRadius * 2,
            BounceDir.Both
        )
    )
    .add(
        new Vector(
            Math.random() * settings.ballSpeed,
            Math.random() * settings.ballSpeed
        ),
        "Velocity"
    );

const animate = () => {
    world.update("all");
    requestAnimationFrame(animate);
};

animate();
