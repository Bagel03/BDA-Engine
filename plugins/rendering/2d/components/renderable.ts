import { type } from "../../../../src/utils/type_id";

export class Renderable {
    static get [type]() {
        return "renderable";
    }

    render(context: CanvasRenderingContext2D): void {}
}
