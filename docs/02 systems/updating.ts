import { System, With } from "../../src/core/system";
import { World } from "../../src/core/world";

// Setup
class Foo {}
const world = new World();

class FooSystem extends System {
    constructor(world: World) {
        super(world, With(Foo));
    }
}
const BarSystem = FooSystem;

world.addSystem(new FooSystem(world));

// To update a system, use world.update():
world.update(FooSystem);

// If you want to update more than one system, use add them to the update call:
world.update(FooSystem, BarSystem);

// If you want to update all the systems in a world, pass in "all" instead of a system:
world.update("all");

// To disable a system (prevent "all" from updating), use world.disableSystem():
world.disableSystem(FooSystem);

// And re-enable it with world.enableSystem():
world.enableSystem(FooSystem);

// NOTE:
// There is no looping in the world, so update() will only be called when you call it manually.
// To get something like this, use requestAnimationFrame() or setInterval() to call update() every frame:
const animate = () => {
    world.update("all");
    requestAnimationFrame(animate);
};
animate();
// OR
setInterval(() => world.update("all"), 1000 / 60);

// Support for complex looping (for things like physics) is coming soon.
