import { System, With } from "../../src/core/system";
import { World } from "../../src/core/world";

// Setup components
class Foo {}
class Bar {}

// System can use as many queries as needed, by adding them to the deceleration:
class FooSystem extends System<["foo", "bar"]> {
    constructor(world: World) {
        super(world, { foo: With(Foo), bar: With(Bar) });
    }

    // And when they are updated, entities is a map of the queries to their respective results
    update() {
        console.log(`There are ${this.entities.foo.size} Foo entities`);
        console.log(`There are ${this.entities.bar.size} Bar entities`);
    }
}

// To remove boilerplate for systems with one query, you can also omit the generic parameter:
class FooSystem2 extends System {
    constructor(world: World) {
        // And pass in one query instead of a map of queries
        super(world, With(Foo));
    }

    update() {
        // Then, "entities" is just the query result (no need for entities.foo)
        console.log(`There are ${this.entities.size} Foo entities`);
    }
}

// The different query types are:
// - With(...Class[]): Returns all entities with all of the given components
// - Without(...Class[]): Returns all entities without all of the given components
// - WithAny(...Class[]): Returns all entities with at least one of the given components
// - WithoutAny(...Class[]): Returns all entities without any of the given components
// - Added(): Returns all entities that were added since the last update
// - Removed(): Returns all entities that were removed since the last update
// - WithAdded(...Class[]): Returns all entities that had all of the given components added since the last update*
// - WithRemoved(...Class[]): Returns all entities that had all of the given components removed since the last update*

//* For WithAdded() and WithRemoved(), adding the entity to the scene counts as adding the component and removing it counts as removing the component.
// Meaning that if an entity with component Foo is removed from the scene, it will be added to all queries with the WithRemoved query.
