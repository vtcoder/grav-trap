class ObstacleBase {
    private ctx: CanvasRenderingContext2D;

    public constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    public render() {
        this.ctx.fillRect(5, 5, 50, 50);
    }
}

class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
    }

    public start(canvas: HTMLCanvasElement): void {
        let o: ObstacleBase = new ObstacleBase(this.ctx);
        o.render();
    }
}