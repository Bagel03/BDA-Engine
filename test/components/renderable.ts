export class Renderable {
    constructor(public w: number, public h: number, public color: string) {}

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.w, this.h);
    }
}
