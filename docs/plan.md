## World (Systems) -> Entities -> Components

-   World holds entities
-   Entities hold components
-   Systems interact with all entities in the world
-   Everything works on an loop

Example:

```rust
let mut world = World::new();

// Create entities
let mut ent1: Entity = Entity::new();
let mut ent2: Entity = Entity::new();

// Add components
ent1.addComponent(Position::new(0, 0));
ent1.addComponent(Rect::new(0, 0, 50, 50, Colors.blue));
ent2.addComponent(Position::new(1, 1));
ent2.addComponent(Sprite::new("./sprite.jpeg"));


struct Moving {}
impl System for Moving {
    queries(&self): Query[] {
        [With(Position)];
    }

    update(&self) {
        for entity of self.entities[0] {
            entity.getComponent(Position).x++;
        }
    }
    ..Default::default()
}

struct Rendering {}
impl System for Rendering {
        queries(&self): Query[] {
        [With(Rect), With(Sprite)];
    }

    update(&self) {
        for entity of self.entities[0] {
            drawRect(entity.getComponent(Rect))
        }

        for entity of self.entities[1] {
            drawSprite(entity.getComponent(Sprite));
        }
    }
    ..Default::default()
}

// Put it all together
world.addSystem(Moving::new());
world.addSystem(Rendering::new());

world.addEnt(ent1);
world.addEnt(ent2);

world.startLoop()
```

## `Added()` and `Removed()` Queries

It is sometimes useful to have systems that only look for:

-   Entities that were added to the scene\*
-   Entities that were removed from the scene\*
-   Entities who had a component added to them\*
-   Entities who had a component removed from them\*
-   **\*Since the system was last run**

Ex:

```rust
// A faster rendering system that doesn't rerender everything every frame
struct BufferRect {}
impl System for BufferRect {
    queries(&self) {
        [With(Added(Rect)), With(Removed(Rect))]
    }

    update(&self) {
        // add new ones
        for entity of self.queries[0] {
            renderRectToBuffer(entity.getComponent(Rect))
        }

        // remove old ones
        for entity of self.queries[1] {
            unRenderRectToBuffer(entity.getComponent(Rect))
        }
    }
    ..Default::default()
}
```

## Problems

-   Cant keep a global list of added components (lots of stack mem)
-   If we just added it to the query starting from the frame beginning,
    you would miss everything that was added after the system is run:
    > ***
    >
    > 1. Frame 1 starts
    > 2. `withAddedRect` list is set to `[]`.
    > 3. `AddEnt` runs and adds a new entity `ent1` with a rect.
    > 4. `World` sees this, adds `ent1` to `withAddedRect`.
    > 5. `BufferRect` runs, rendering everything in `withAddedRect` (just `ent1`).
    > 6. `AddOtherEnt` runs, adds another entity with a rect.
    > 7. `World` sees this too, adds `ent2` to `withAddedRect`.
    > 8. Frame 1 ends
    >
    > ***
    >
    > 9. Frame 2 starts
    > 10. `withAddedRect` list is set to `[]`.
    > 11. `AddEnt` skips itself
    > 12. `BufferRect` runs, rendering everything in `withAddedRect` (nothing).
    > 13. `AddOtherEnt` also skips itself
    > 14. Frame 2 ends
    >
    > ***

### `Ent2` was never rendered, despite being in the scene.

---

## Solution 1: Reset `withAddedRect` right after `BufferRect` runs

-   Both `ent1` and `ent2` would be in the list eventually

> ---
>
> 1. Frame 1 starts
> 2. `withAddedRect` list is set to `[]`.
> 3. `AddEnt` runs and adds a new entity `ent1` with a rect.
> 4. `World` sees this, adds `ent1` to `withAddedRect`.
> 5. `BufferRect` runs, rendering everything in `withAddedRect` (just `ent1`).
> 6. `withAddedRect` set to `[]`
> 7. `AddOtherEnt` runs, adds another entity with a rect.
> 8. `World` sees this too, adds `ent2` to `withAddedRect`.
> 9. Frame 1 ends
>
> ---
>
> 10. Frame 2 starts
> 11. `AddEnt` skips itself
> 12. `BufferRect` runs, rendering everything in `withAddedRect` (`ent2`).
> 13. `withAddedRect` set to `[]`
> 14. `AddOtherEnt` also skips itself
> 15. Frame 2 ends
>
> ---

### Problem: `StaticCollisionDetect` (or another random system) needs `withAddedRect` too:

> ---
>
> 1. Frame 1 starts
> 2. `withAddedRect` list is set to `[]`.
> 3. `StaticCollisionDetect` goes through `withAddedRect` (finds nothing)
> 4. `AddEnt` runs and adds a new entity `ent1` with a rect.
> 5. `World` sees this, adds `ent1` to `withAddedRect`.
> 6. `BufferRect` runs, rendering everything in `withAddedRect` (just `ent1`).
> 7. `withAddedRect` set to `[]`
> 8. `AddOtherEnt` runs, adds another entity with a rect.
> 9. `World` sees this too, adds `ent2` to `withAddedRect`.
> 10. Frame 1 ends
>
> ---
>
> 11. Frame 2 starts
> 12. `StaticCollisionDetect` goes through `withAddedRect` (finds `ent2`)
> 13. `AddEnt` skips itself
> 14. `BufferRect` runs, rendering everything in `withAddedRect` (`ent2`).
> 15. `withAddedRect` set to `[]`
> 16. `AddOtherEnt` also skips itself
> 17. Frame 2 ends
>
> ---

### `ent1` was never run on `StaticCollisionDetect`

---

## Possible Solution 2: Each system holds its own targets.

-   Whenever an entity is added every system tests its queries, and if it goes through it is added to said system's entities
-   After each update, those queries with `added` or `removed` are cleared

### Drawbacks

-   Could be optimized (`Movement` shouldn't have to test when a `Rect` is added) but that means that queries need to be separate from systems (complex we need to think about it)
-   Have to keep track of which queries to reset after the update

Mock impl:

```rust
trait Query {
    test(&self, entity: Entity): bool;
}

trait System {
    mut entities: Entity[][]; // QueryIndex : entity[]
    mut queries: Query[];
    mut resetQueries: i32[];

    update(&self): ();

    updateInternal(&self): () {
        self.update()
        for index in self.resetQueries {
            self.queries[index] = [];
        }
    }

    onComponentAdded(&self, entity: Entity) {
        // Check all queries
        // PROBLEM HERE
        for query in self.queries {
            if query.test(entity) {
                self.entities[query.index].push(entity)
            }
        }
    }
}

impl World {
    systems: System[];

    entityComponentAdded(&self, entity: Entity, component: Component): () {
        for system in self.systems {
            system.onComponentAdded(entity)
        }
    }
}

impl Entity {
    addComponent(&self, component: Component) {
        self.world.entityComponentAdded(component)
    }
}
```

### Problem: Extra work & possible double adds

-   We check every system on every component add
-   Consider if a system has two queries: `Added<Rect>` and `With<Position>`
    -   Works fine the first time (Both queries are called both times, and eventually register the entity)
    -   `Rect` is removed from the entity (no big deal)
    -   `Rect` is re-added to the entity (BIG DEAL)
        -   `Added<Rect>` adds this entity to its results
        -   `With<Position>` checks the entity, sees that it still has `Position` adds it _again_

---

So we need something that can only ping the queries that care about it **how do we know if it cares if we dont test?**

OR

Something that checks every frame for updates **Slow**

Other notes:

-   Complex queries (`And<With<Position>, Added<Rect>>`)
-   `Added` for entities
    -   Called when a entity is added, not when a component is added
-   reducing mem as much as possible (registering event listeners / dispatching them is memory heavy)
