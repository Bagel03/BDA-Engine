import { System, With } from "../core/system";
import { World } from "../core/world";

const world = new World();

const context = document.createElement("canvas").getContext("2d")!;
world.addResource(context);
document.body.appendChild(context.canvas);

class Rect {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {}
}

class Rendering extends System<{ targets: any }> {
    constructor(world: World) {
        super(world, {
            targets: With(Rect),
        });
    }

    update() {
        context.clearRect(0, 0, 1000, 1000);
        this.entities.targets.forEach((e) => {
            const rect = e.getComponent(Rect);
            this.world
                .getResource(CanvasRenderingContext2D)
                .fillRect(rect.x, rect.y, rect.width, rect.height);
        });
    }
}

class Move extends System<{ targets: any }> {
    constructor(world: World) {
        super(world, {
            targets: With(Rect),
        });
    }

    update(...args: any[]): void {
        this.entities.targets.forEach((e) => {
            const rect = e.getComponent(Rect);
            rect.x += 1;
        });
    }
}

world.addSystem(new Rendering(world));
world.addSystem(new Move(world));

const ent = world.spawn();
ent.addComponent(new Rect(0, 0, 100, 100));

window.setInterval(() => {
    world.update("all");
}, 1000 / 60);
