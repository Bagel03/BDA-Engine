import { Entity } from "../../../src/core/entity";
import { Matrix } from "../../shared/math/matrix";
import { Vector } from "../../shared/math/vector";
import { Renderable } from "./renderable";

type shapeType = "rect" | "arc" | "fillText";

type shapeOptions = {
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    fill: boolean;
    stroke: boolean;
};

export class Shape<T extends shapeType> extends Renderable {
    // get [type]() {
    //     return "renderable";
    // }

    public options: shapeOptions;

    constructor(
        public readonly type: T,
        public args: Parameters<CanvasRenderingContext2D[T]>,
        options: Partial<shapeOptions> = {}
    ) {
        super();

        this.options = options as shapeOptions;

        this.options.fillStyle ??= "black";
        this.options.strokeStyle ??= "black";
        this.options.lineWidth ??= 1;
        this.options.fill ??= true;
        this.options.stroke ??= true;
    }

    render(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.fillStyle = this.options.fillStyle;
        context.strokeStyle = this.options.strokeStyle;
        context.lineWidth = this.options.lineWidth;
        context[this.type](...this.args);
        if (this.options.fill) {
            context.fill();
        }
        if (this.options.stroke) {
            context.stroke();
        }
    }
}

export const ShapeBundle =
    <T extends shapeType>(
        type: T,
        x: number,
        y: number,
        shapeArgs: Parameters<CanvasRenderingContext2D[T]>,
        shapeOptions?: shapeOptions
    ) =>
    (entity: Entity) => {
        entity.add(Matrix.identity(3).setPos(new Vector(x, y)), "Position");
        entity.add(new Shape(type, shapeArgs, shapeOptions));
    };
