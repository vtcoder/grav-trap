class Game {
    private static PIXELS_PER_MOVE: number = 10;
    private static MILLISEC_PER_MOVE: number = 50;

    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _currentTimeUnit: number;

    public constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
        this._currentTimeUnit = 0;
    }

    public start(): void {
        //TODO move the array of obstacles to a 'Level' object, or something to capture a given layout of obstacles. It could also have a bg image for each level etc.
        let obstacles: Array<Obstacle> = [
            new WallObstacleLg(this._ctx, Game.PIXELS_PER_MOVE, 1, true),
            new WallObstacleSm(this._ctx, Game.PIXELS_PER_MOVE, 20, true),
            new WallObstacleSm(this._ctx, Game.PIXELS_PER_MOVE, 100, true),
            new WallObstacleMd(this._ctx, Game.PIXELS_PER_MOVE, 180, true),
            new WallObstacleLg(this._ctx, Game.PIXELS_PER_MOVE, 25, false),
            new WallObstacleMd(this._ctx, Game.PIXELS_PER_MOVE, 50, false),
            new WallObstacleSm(this._ctx, Game.PIXELS_PER_MOVE, 100, false),
            new WallObstacleLg(this._ctx, Game.PIXELS_PER_MOVE, 120, false)
        ];
        let player: Player = new Player(this._ctx, Game.PIXELS_PER_MOVE);

        window.addEventListener("keydown", (evt) => {
            if (evt.keyCode == 38) {
                player.startJump();
            }
        }, true);

        window.addEventListener("keyup", (evt) => {
            if (evt.keyCode == 38) {
                player.endJump();
            }
        }, true);

        //Perform initial renderings (before we start moving the screen).
        player.render();

        setInterval(() => {
            //Clear screen.
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

            //Render all obstacles.
            for (let o of obstacles) {
                if (o.isStarted || o.order <= this._currentTimeUnit) {
                    o.moveObstacle();
                    o.render();
                }
            }

            //Render player.
            player.render();

            //Increment current time unit.
            this._currentTimeUnit++;
        }, Game.MILLISEC_PER_MOVE);
    }
}

abstract class RenderableItem {
    protected _ctx: CanvasRenderingContext2D;
    protected _x: number;
    protected _y: number;
    protected _w: number;
    protected _h: number;
    protected _pixelsPerMove: number; //The number of pixels an object should shift for a single move.

    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number, x: number, y: number, w: number, h: number) {
        this._ctx = ctx;
        this._x = x; //Left x
        this._y = y; //Bottom y
        this._w = w;
        this._h = h;
        this._pixelsPerMove = pixelsPerMove;
    }

    public abstract render();
}

class Player extends RenderableItem {
    private static PLAYER_X_COORD: number = 100;
    private static PLAYER_Y_COORD_OFFSET: number = 2;
    private static PLAYER_WIDTH: number = 20;
    private static PLAYER_HEIGHT: number = 20;
    private static PLAYER_COLOR: string = "red";

    private _normalY: number;
    private _isJumping: boolean;

    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number) {
        //Calculate starting X,Y coordinates. All players start visible, toward the left bottom of the screen.
        let y: number = ctx.canvas.height - Player.PLAYER_HEIGHT - Player.PLAYER_Y_COORD_OFFSET;

        super(ctx, pixelsPerMove, Player.PLAYER_X_COORD, y, Player.PLAYER_WIDTH, Player.PLAYER_HEIGHT);

        this._normalY = y;
        this._isJumping = false;
    }

    public render(): void {
        //Check for jump status.
        if (this._isJumping) {
            this._y -= this._pixelsPerMove;
        } else {
            if (this._y < this._normalY) {
                this._y += this._pixelsPerMove;
            }
        }

        this._ctx.fillStyle = Player.PLAYER_COLOR;
        this._ctx.fillRect(this._x, this._y, this._w, this._h);
    }

    public startJump(): void {
        this._isJumping = true;
    }

    public endJump(): void {
        this._isJumping = false;
    }
}

abstract class Obstacle extends RenderableItem {
    protected _isStarted: boolean; //Started means it has started motion from left edge, to be visible, moving toward right edge.
    protected _isActive: boolean; //Active means it has not passed the left edge.
    protected _order: number; //Number of time units before this obstiacle starts.
    protected _isTop: boolean; //Determines if the obstacle appears on the ceiling or floor.
    
    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number, w: number, h: number, order: number, isTop: boolean) {
        //Calculate starting X,Y coordinates. All obsticals start off the right edge.
        let x: number = ctx.canvas.width + 10;
        let y: number = isTop ? 0 : ctx.canvas.height - h; //Determine Y coordinate based on if it is a top or bottom obstacle.

        super(ctx, pixelsPerMove, x, y, w, h);

        this._order = order;
        this._isStarted = false;
        this._isActive = true;
    }

    public moveObstacle() {
        this._x -= this._pixelsPerMove; //Move X coord to move obstacle from right to left.

        //Check to see if the obstical is still active (i.e., still on the screen).
        if (this._isActive && this._x < 0 - this._w) {
            this._isActive = false;
        }

        //Check to see if the obstical has started (i.e., has first appeard on teh screen).
        //if (!this._isStarted && this._x < this._ctx.canvas.width) {
        //    this._isStarted = true;
        //}
        this._isStarted = true;
    }

    public get isActive(): boolean {
        return this._isActive;
    }

    public get isStarted(): boolean {
        return this._isStarted;
    }

    public get order(): number {
        return this._order;
    }

    public set order(value: number) {
        this._order = value;
    }
}

class WallObstacle extends Obstacle {
    private _wallColor: string;

    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number, wallWidth: number, wallHeight: number, wallColor: string, order: number, isTop: boolean) {
        super(ctx, pixelsPerMove, wallWidth, wallHeight, order, isTop);
        this._wallColor = wallColor;
    }

    public render() {
        this._ctx.fillStyle = this._wallColor;
        this._ctx.fillRect(this._x, this._y, this._w, this._h);
    }
}

class WallObstacleLg extends WallObstacle {
    private static WALL_WIDTH: number = 50;
    private static WALL_HEIGHT: number = 200;
    private static WALL_COLOR: string = "yellow";

    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number, order: number, isTop: boolean) {
        super(ctx, pixelsPerMove, WallObstacleLg.WALL_WIDTH, WallObstacleLg.WALL_HEIGHT, WallObstacleLg.WALL_COLOR, order, isTop);
    }
}

class WallObstacleMd extends WallObstacle {
    private static WALL_WIDTH: number = 50;
    private static WALL_HEIGHT: number = 100;
    private static WALL_COLOR: string = "blue";

    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number, order: number, isTop: boolean) {
        super(ctx, pixelsPerMove, WallObstacleMd.WALL_WIDTH, WallObstacleMd.WALL_HEIGHT, WallObstacleMd.WALL_COLOR, order, isTop);
    }
}

class WallObstacleSm extends WallObstacle {
    private static WALL_WIDTH: number = 50;
    private static WALL_HEIGHT: number = 50;
    private static WALL_COLOR: string = "orange";

    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number, order: number, isTop: boolean) {
        super(ctx, pixelsPerMove, WallObstacleSm.WALL_WIDTH, WallObstacleSm.WALL_HEIGHT, WallObstacleSm.WALL_COLOR, order, isTop);
    }
}
