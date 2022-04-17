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

// Sometimes you might want to store one instance of a type of data for the whole world.
// If there is no reason for it to be an entity (It would not interact with anything and shares no behavior),
// You can add it as a resource using world.addResource():

const APIKeys = {
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ": "SuperSecretKey",
};
world.addResource(APIKeys, "APIKeys"); // Like components, if it is simple data you need to add a name

// Then get it using world.getResource():
const APIKeysGot = world.getResource<typeof APIKeys>("APIKeys");

// You can also remove it using world.removeResource():
world.removeResource("APIKeys");

// And clear all the resources using world.clearResources():
world.clearResources();

// You do not need to add names if you pass in a class instance
world.addResource(new Foo());
world.getResource(Foo);
