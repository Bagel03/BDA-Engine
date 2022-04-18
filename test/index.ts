import { World } from "../src/core/world";
import { BounceDir, Collider } from "./components/collider";
import { Position } from "./components/pos";
import { Renderable } from "./components/renderable";
import { Velocity } from "./components/vel";
import { Bouncer } from "./systems/bouncer";
import { MovementSystem } from "./systems/movement";
import { PaddleMovement } from "./systems/paddles";
import { Rendering } from "./systems/rendering";

declare global {
    interface Window {
        world: World;
    }
}

const world = new World();
window.world = world;

// Resource setup
const size = {
    width: 800,
    height: 600,
};

world.addSystem(new PaddleMovement());
world.addSystem(new Rendering());
world.addSystem(new MovementSystem());
//@ts-ignore FIX THIS
world.addSystem(new Bouncer());

const wallWidth = 10;
// Paddles
const paddleWidth = wallWidth;
const paddleHeight = 100;

const paddles = ["1", "2"]
    .map((str) => world.spawn(`paddle${str}`))
    .forEach((ent, idx) => {
        ent.add(
            new Position(
                idx * (size.width - paddleWidth),
                size.height / 2 - paddleHeight / 2
            )
        )
            .add(new Collider(paddleWidth, paddleHeight, BounceDir.Horizontal))
            .add(null, "paddle")
            .add(new Renderable(paddleWidth, paddleHeight, "blue"));
    });

const walls = ["top", "bottom"]
    .map((str) => world.spawn(`wall${str}`))
    .forEach((ent, idx) => {
        ent.add(new Position(0, idx * (size.height - wallWidth)))
            .add(new Collider(size.width, wallWidth, BounceDir.Vertical))
            .add(new Renderable(size.width, wallWidth, "white"));
    });

const ball = world.spawn("ball");
ball.add(new Position(size.width / 2, size.height / 2))
    .add(new Velocity(-3, 5))
    .add(new Collider(10, 10, BounceDir.Horizontal))
    .add(new Renderable(10, 10, "red"))
    .add(null, "ball");

const animate = () => {
    world.update("all");
    requestAnimationFrame(animate);
};

animate();
