class Game {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _bgStartingX: number;
    private _bgStartingY: number;

    public constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
        this._bgStartingX = this._canvas.width + 10;
        this._bgStartingY = 0;
    }

    public start(canvas: HTMLCanvasElement): void {
        let o: Obstacle = new WallObstacle(this._ctx, this._bgStartingX, this._bgStartingY);
        o.render();

        setInterval(() => {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            o.bgMove();
            o.render();
        }, 50);
    }
}

abstract class RenderableItem {
    protected _ctx: CanvasRenderingContext2D;
    protected _x: number;
    protected _y: number;
    protected _w: number;
    protected _h: number;

    public constructor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        this._ctx = ctx;
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
    }

    public abstract render();

    public bgMove() {
        this._x -= 10;
    }
}

abstract class Obstacle extends RenderableItem {
}

class WallObstacle extends Obstacle {
    private static WALL_WIDTH: number = 50;
    private static WALL_HEIGHT: number = 200;
    private static WALL_COLOR: string = "yellow";

    public constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
        super(ctx, x, y, WallObstacle.WALL_WIDTH, WallObstacle.WALL_HEIGHT);
    }

    public render() {
        this._ctx.fillStyle = WallObstacle.WALL_COLOR;
        this._ctx.fillRect(this._x, this._y, this._w, this._h);
    }
}

