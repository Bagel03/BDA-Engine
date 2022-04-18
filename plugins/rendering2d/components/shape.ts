import { Entity } from "../../../src/core/entity";
import { Class } from "../../../src/types/class";
import { type } from "../../../src/utils/type_id";
import { Matrix } from "../../shared/math/matrix";
import { Vector } from "../../shared/math/vector";
import { Renderable } from "../renderable";

type shapeType = "rect" | "arc" | "fillText";

type shapeOptions = {
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    fill?: boolean;
    stroke?: boolean;
};

export class Shape<T extends shapeType> extends Renderable {
    // get [type]() {
    //     return "renderable";
    // }

    constructor(
        public readonly type: T,
        public args: Parameters<CanvasRenderingContext2D[T]>,
        public options: shapeOptions = {}
    ) {
        super();

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
        context[this.type].apply(context, this.args);
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
