import { System, With } from "../../src/core/system";
import { World } from "../../src/core/world";

// Everything is held in the world:
const world = new World();

// The way an ECS works is by abstracting data away from logic.
// Each "thing" in the game is an entity.
// Entities store data in a map of components.
// Systems look at this data and change it, "updating" the entities.

// Entities can be created with world.spawn():
const player = world.spawn("player");
// Or with a default ID:
const enemy = world.spawn();

// Components can be any type of data, but each entity can oly have one of each type of component.
class Foo {}
class Bar {}

// Add them to entities using entity.add():
player.add(new Foo());
player.add(new Bar());

// You can also name them, letting you use a class more than once
player.add(new Foo(), "foo");
player.add(new Foo(), "bar");

// To retrieve them, use entity.get():
const foo = player.get(Foo); // Type "foo" is inferred on the returned value
const bar = player.get(Bar);
// Or by name:
const foo2 = player.get("foo"); // However, no type is found, so you have to specify it
const bar2 = player.get<Foo>("bar"); // Type "foo" is now inferred

// You can also check if an entity has a component:
if (player.has(Foo)) {
    // Do something
}
// Or by name:
if (player.has("foo")) {
    // Do something
}

// To remove a component, use entity.remove():
player.remove(Foo);
player.remove("foo");

// And to remove all the components of an entity, use entity.clear():
player.clear();

// To interact with entities, create a system by extending the System class:
class FooSystem extends System {
    constructor(world) {
        super(world, With(Foo));
    }

    update() {
        console.log(`There are ${this.entities.size} Foo entities`);
    }
}

// Systems take in a world and queries, and then update the queried entities.
// Queries are used to filter entities by components, or based on events that happened to that entity:

// Add the system to the world:
world.addSystem(new FooSystem(world));

// To run the system, use world.update():
world.update(FooSystem);

// Prints there are 1 Foo entities
