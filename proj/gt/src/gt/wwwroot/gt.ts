class Game {
    private static PIXELS_PER_MOVE: number = 10;
    private static MILLISEC_PER_MOVE: number = 50;
    private static MILLISEC_GAME_TIMEOUT: number = 50;

    private _gamePlayStarted: boolean = false;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _timerId: any;
    private _currentTimeUnit: number;

    private _startScreen: StartScreen;
    private _player: Player;    
    private _obstacles: Array<Obstacle>;

    public constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
        this._currentTimeUnit = 0;

        this._startScreen = new StartScreen(this._ctx, Game.PIXELS_PER_MOVE);
        this._player = new Player(this._ctx, Game.PIXELS_PER_MOVE);
        //TODO move the array of obstacles to a 'Level' object, or something to capture a given layout of obstacles. It could also have a bg image for each level etc.
        this._obstacles = [
            new WallObstacleLg(this._ctx, Game.PIXELS_PER_MOVE, 1, true),
            new WallObstacleSm(this._ctx, Game.PIXELS_PER_MOVE, 20, true),
            new WallObstacleSm(this._ctx, Game.PIXELS_PER_MOVE, 100, true),
            new WallObstacleMd(this._ctx, Game.PIXELS_PER_MOVE, 180, true),
            new WallObstacleLg(this._ctx, Game.PIXELS_PER_MOVE, 25, false),
            new WallObstacleMd(this._ctx, Game.PIXELS_PER_MOVE, 50, false),
            new WallObstacleSm(this._ctx, Game.PIXELS_PER_MOVE, 100, false),
            new WallObstacleLg(this._ctx, Game.PIXELS_PER_MOVE, 120, false),
            new Goal(this._ctx, Game.PIXELS_PER_MOVE, 225, false)
        ];

        window.addEventListener("keydown", (evt) => this.handleKeyDown(evt), true);
        window.addEventListener("keyup", (evt) => this.handleKeyUp(evt), true);
    }

    protected handleKeyDown(evt): void {
        if (this._gamePlayStarted) {
            if (evt.keyCode == 38) {
                this._player.startJump();
            }
        }
    }

    protected handleKeyUp(evt): void {
        if (this._gamePlayStarted) {
            if (evt.keyCode == 38) {
                this._player.endJump();
            }
        } else {
            this._gamePlayStarted = true;
            this._start();
        }
    }

    protected handleTimeUnitElapse(): void {
        //Clear screen.
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        //Render player.
        this._player.render();

        //Render all obstacles.
        for (let o of this._obstacles) {
            if (o.isStarted || o.order <= this._currentTimeUnit) {
                //Render obstacle.
                o.moveObstacle();
                o.render();

                if (o instanceof Goal) {
                    //Evaluate if player has reached the end goal.
                    if (this._player.hasPassedObstacle(o)) {
                        this._player.hasReachedGoal = true;
                    }
                }
                else {
                    //Evaluate if player has hit an obstacle.
                    if (this._player.isTouchingObstacle(o)) {
                        this._player.hasHitObstacle = true;
                    }
                }
            }
        }

        //Check to see if the player hit an obstacle.
        if (this._player.hasHitObstacle) {
            this.stop();
            alert('Game Over');
        }

        //Check to see if the player has reached the goal.
        if (this._player.hasReachedGoal) {
            this.stop();
            alert('Level complete!');
        }
        
        //Increment current time unit.
        this._currentTimeUnit++;
    }

    public start(): void {
        this._startScreen.render();
    }

    private _start(): void {
        //Perform initial renderings (before we start moving the screen).
        this._player.render();

        //Set up the timer and handler. Note I had to wrap the call to handleTimeUnitElapse in an anonymous function, otherwise references to this._blah were invalid inside that method.
        this._timerId = setInterval(() => this.handleTimeUnitElapse(), Game.MILLISEC_PER_MOVE);
    }

    public stop(): void {
        clearInterval(this._timerId);
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

    public get X_Left(): number { return this._x; }
    public get X_Right(): number { return this._x + this._w; }
    public get Y_Top(): number { return this._y; }
    public get Y_Bottom(): number { return this._y + this._h; }
    public get W(): number { return this._w; }
    public get H(): number { return this._h; }

    public abstract render();
}

class StartScreen extends RenderableItem {
    private static START_SCREEN_BG_COLOR: string = "purple";
    private static START_SCREEN_FG_COLOR: string = "black";
    private static START_SCREEN_FG2_COLOR: string = "lightblue";

    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number) {
        //Determine X,Y coordinates for start screen        
        let wBuf: number = 90;
        let hBuf: number = 60
        let x: number = wBuf;
        let y: number = hBuf;
        let w: number = ctx.canvas.width - (wBuf * 2);
        let h: number = ctx.canvas.height - (hBuf * 2);

        super(ctx, pixelsPerMove, x, y, w, h);
    }

    public render(): void {
        //Render background.
        this._ctx.fillStyle = StartScreen.START_SCREEN_BG_COLOR;
        this._ctx.fillRect(this._x, this._y, this._w, this._h);

        //Render title.
        this._ctx.font = "72pt Tahoma";
        this._ctx.fillStyle = StartScreen.START_SCREEN_FG_COLOR;
        this._ctx.fillText("Gravity Trap", this._x + 60, this._y + 100);

        //Render start instructions.
        this._ctx.font = "32pt Tahoma";
        this._ctx.fillStyle = StartScreen.START_SCREEN_FG2_COLOR;
        this._ctx.fillText("Press Up Arrow To Start", this._x + 90, this._y + 200);
    }
}

class Player extends RenderableItem {
    private static PLAYER_X_COORD: number = 100;
    private static PLAYER_Y_COORD_OFFSET: number = 2;
    private static PLAYER_WIDTH: number = 20;
    private static PLAYER_HEIGHT: number = 20;
    private static PLAYER_COLOR: string = "red";

    private _normalY: number;
    private _isJumping: boolean;
    private _hasHitObstacle: boolean;
    private _hasReachedGoal: boolean;

    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number) {
        //Calculate starting X,Y coordinates. All players start visible, toward the left bottom of the screen.
        let y: number = ctx.canvas.height - Player.PLAYER_HEIGHT - Player.PLAYER_Y_COORD_OFFSET;

        super(ctx, pixelsPerMove, Player.PLAYER_X_COORD, y, Player.PLAYER_WIDTH, Player.PLAYER_HEIGHT);

        this._normalY = y;
        this._isJumping = false;
    }

    public get hasHitObstacle(): boolean {
        return this._hasHitObstacle;
    }

    public set hasHitObstacle(value: boolean) {
        this._hasHitObstacle = value;
    }

    public get hasReachedGoal(): boolean {
        return this._hasReachedGoal;
    }

    public set hasReachedGoal(value: boolean) {
        this._hasReachedGoal = value;
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

    public isTouchingObstacle(obstacle: Obstacle): boolean {
        let isTouching: boolean = false;

        if (this.X_Right > obstacle.X_Left && this.X_Right < obstacle.X_Right) {
            if (this.Y_Top > obstacle.Y_Top && this.Y_Top < obstacle.Y_Bottom) {
                isTouching = true;
            } else if (this.Y_Bottom > obstacle.Y_Top && this.Y_Bottom < obstacle.Y_Bottom) {
                isTouching = true;
            }
        }

        return isTouching;
    }

    public hasPassedObstacle(obstacle: Obstacle): boolean {
        let hasPassed: boolean = false;

        if (this.X_Right >= obstacle.X_Left) {
            hasPassed = true;
        }

        return hasPassed;
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

class Goal extends Obstacle {
    private static GOAL_WIDTH: number = 50;
    private static GOAL_HEIGHT: number = 100;
    private static GOAL_COLOR: string = "green";

    public constructor(ctx: CanvasRenderingContext2D, pixelsPerMove: number, order: number, isTop: boolean) {
        super(ctx, pixelsPerMove, Goal.GOAL_WIDTH, Goal.GOAL_HEIGHT, order, isTop);
    }

    public render(): void {
        this._ctx.fillStyle = Goal.GOAL_COLOR;
        this._ctx.fillRect(this._x, this._y, this._w, this._h);
    }
}