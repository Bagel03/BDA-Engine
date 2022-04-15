## API:

```ts
const world = new World();

// Resources
world.addResource(5, "ticks");
world.addResource(new FrameResource())

// Simple entities
const ent = world.spawn();
ent.addComponent(5, "x");
ent.addComponent(new PositionComponent(1, 1));

// Blueprints
const blueprint = new EntityBlueprint();
blueprint.addComponent(5, "x");
blueprint.addComponent(new PositionComponent(1, 1));
world.addBlueprint(blueprint);

// Object Pooling (faster)
ent.addComponent(PositionComponent, [1, 1]);
blueprint.addComponent(PositionComponent, [1, 1]);

// Queries
new Query(
    // With or without components
    With(PositionComponent),
    Without(FooComponent),

    // With new components
    // (Also called if blueprint is added with component)
    With(Added(BarComponent)),
    With(Removed(BinComponent)),

    // Added or removed
    Added,
    Removed,

    // Combining querys
    With(And(FooComponent, BarComponent, BinComponent)),
    With(Or(FooComponent, BarComponent, BinComponent))
)

// Systems
class MySystem extends System {
    constructor() {
        super({
            foos: new Query(With(FooComponent))
            newFoos: new Query(With(Added(FooComponent)))
        })
    }

    update() {
        const { foos, newFoos } = this.queries;
        foos.forEach((ent, id) => {
            console.log(`Entity with FooComponent (${id}):`, ent);
        })
        newFoos.forEach((ent, id) => {
            console.log(`New entity with FooComponent (${id}):`, ent);
        })
    }
}


world.addSystem(new MySystem());


```
