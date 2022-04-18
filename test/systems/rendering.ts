import { System, With } from "../../src/core/system";
import { Position } from "../components/pos";
import { Renderable } from "../components/renderable";

export class Rendering extends System {
    private readonly context: CanvasRenderingContext2D;

    constructor() {
        super(With(Renderable));
        this.context = document.createElement("canvas").getContext("2d");
        document.body.appendChild(this.context.canvas);
        this.resize();

        // window.addEventListener("resize", () => this.resize());
    }

    private resize() {
        this.context.canvas.width = 800;
        this.context.canvas.height = 600;
    }

    update() {
        this.context.fillStyle = "#00000033";
        this.context.fillRect(0, 0, 800, 600);
        this.entities.forEach((entity) => {
            this.context.translate(
                entity.get(Position).x,
                entity.get(Position).y
            );
            entity.get(Renderable).render(this.context);
            this.context.translate(
                -entity.get(Position).x,
                -entity.get(Position).y
            );
        });
    }
}
