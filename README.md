# BDA ENGINE

### A _type-based_ ergonomic game engine for typescript

---

BDA Engine aims to make your code as readable and as self describing as possible, without the need for the verbose language that accompanies many engines. Inspired by _bevy_, it provides a type-based ECS, which can be used to author games of any size:

```ts
const world = new World();
const player = new Entity("player");
player.add(new HitBox(0, 0, 50, 50));
world.add(player);
const walls = generateWalls();
world.add(walls);

/** @system */
function movePlayer(player: Ent<"player">, walls: Query<[Rect]>) {
    for (const [Rect, Wall] of walls) {
        if (player.get(HitBox).intersects(Rect)) {
            console.log("Player Collided with wall" + Wall.id);
        }
    }
}

world.addSystem(movePlayer);
world.update();
```

## Setup:

1.  Install through NPM
2.  Install `ttypescript` (Notice the double t)
3.  Add
    ```json
        "plugins": [
            {
                "transform": "bda-engine/transformer"
            }
        ]
    ```
    to your tsconfig compiler options.
4.  Change your build scripts to use ttsc instead of tsc.

## Setup (Using .tgz)

1. Download the .tgz here (Lol its not here rn build it urself)
2. Add it to your `package.json`:
    ```json
    "bda-engine": "file:bda-engine-0.0.0.tgz"
    ```
3. `npm i`

## Any components you want, on the fly

Unlike other ECS's, BDA has no registry of components, so no need to `registerComponent` before you use it. It also does not require your components to fit a shape, meaning that components can be **_anything_**.

```ts
myEnt.addComponent(new MyComplexComponent());
myEnt.addComponent(new Date());
myEnt.addComponent("Hello");
```

It also allows you to have components of the same type, as long as they have different names, without need for extra methods or overrides

```ts
// Other engines
class Color {
    static getName() {
        return "Color";
    }

    constructor(public color: string) {}
}
class BGColor extends Color {
    static getName() {
        return "bg"
    }
}

myEnt.addComponent(new Color("#FFFFFF"))
myEnt.addComponent(new BGColor("#000000"))

// BDA
myEnt.addComponent("#FFFFFF", "Color")
myEnt.addComponent("#000000", "bg)
```

To get components, you can pass in its type, or if you have more than one component with the same type, its name:

```ts
myEnt.getComponent(MyComplexComponent); // Already of type MyComplexComponent
myEnt.getComponent<string>("Color"); // Because you are using the name of the component, you need to provide the type
myEnt.getComponent<string>("bg");
```

However, some default named components do not need this type.

## Systems as functions, powered by _types_

Many ECS's require long, drawn-out, repetitive system impls:

```ts
// Other ECS™
class mySystem extends System<["players", "walls"]> {
    constructor(world: World) {
        super(world, {
            players: With(PlayerComponent),
            walls: With(WallCollider),
        });
    }

    update() {
        this.queryResults.players.forEach((player) => {
            this.queryResults.walls.forEach((wall) => {
                if (player.get(PlayerComponent).intersects(wall.WallCollider)) {
                    console.log(
                        `Collision between ${player.id} and ${wall.id}`
                    );
                    this.world.globals.HUD.showGameOver();
                }
            });
        });
    }
}
```

You often repeat yourself, and asking for the wall component twice is annoying.

This is where BDA shines:
By using a custom transformer, BDA can convert shorter, more readable syntax, into longer garbage (similar to above). The equivalent system in BDA would be:

```ts
/** @system **/
function mySys(
    walls: Query<[WallCollider]>,
    players: Query<[PlayerComponent]>,
    HUD: Res<HUD>
) {
    for (const [wall, wallEnt] of walls) {
        for (const [player, playerEnt] of players) {
            if (player.intersects(wall)) {
                console.log(
                    `Collision between ${playerEnt.id} and ${wallEnt.id}`
                );
                HUD.showGameOver();
            }
        }
    }
}
```

There are a lot of different parameters for systems:

-   Query: Query for all entities with matching components
-   Ent: Get a single entity by it's ID
-   Res: Get a resource by it's ID
-   World: Get full access to the world

Just like components, there is no systemRegistry, so just `addSystem` when you want to add it, and `disableSystem` when you want to remove it.

## Global Objects With Resources

It might make sense to have some global objects that are not entities (Assets, spacial grids, etc), Instead of a big `globals` object, you can insert these as resources, which can be thought about as "components for the world":

```ts
world.addRes(new Background());
world.addRes(new Date(), "start");
world.addRes(12, "highscore");

world.getRes(Background); // Background type is inferred
world.getRes<Date>("start");
world.getRes<number>("highscore");
```

## Queries

To build a useful system, querying for specific entities is essential. Queries search the world and return entities that match. The general form is: `Query<[Needed, Components]>` or `Query<[Needed, Components], Modifier>`. These will return an iterator, which allows you to loop over all the entities, **AND** the components that were asked for. This avoids the repetitive nature that might come from something like this:

```ts
// Others
function mySys(walls: Query<With<WallCollider>>) {
    for (const wallEnt of walls) {
        const wall = wallEnt.get(WallCollider);
        // Do stuff with wall
    }
}

// BDA
function mySys(walls: Query<[WallCollider]>) {
    for (const [wall] of walls) {
        // If you need the entity, [wall, wallEnt] will work instead
        // Do stuff with wall
    }
}
```
