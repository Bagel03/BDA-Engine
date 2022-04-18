import { System, With } from "../../src/core/system";
import { Matrix } from "../shared/math/matrix";
import { Renderable } from "./renderable";

export class Renderer extends System {
    public readonly context: CanvasRenderingContext2D;
    constructor() {
        super(With(Renderable, "Position"));

        this.context = document.createElement("canvas").getContext("2d");
        document.body.appendChild(this.context.canvas);
        this.resize();

        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        this.context.canvas.width = window.innerWidth;
        this.context.canvas.height = window.innerHeight;
    }

    update() {
        this.context.clearRect(
            0,
            0,
            this.context.canvas.width,
            this.context.canvas.height
        );
        this.entities.forEach((entity) => {
            const renderable = entity.get(Renderable);
            const position = entity.get<Matrix<3, 3>>("Position");
            this.context.setTransform(position.toDom2dMatrix());
            renderable.render(this.context);
            this.context.resetTransform();
        });
    }
}
