var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Game = (function () {
    function Game(canvas) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
        this._currentTimeUnit = 0;
    }
    Game.prototype.start = function () {
        var _this = this;
        //TODO move the array of obstacles to a 'Level' object, or something to capture a given layout of obstacles. It could also have a bg image for each level etc.
        var obstacles = [
            new WallObstacleLg(this._ctx, Game.PIXELS_PER_MOVE, 1, true),
            new WallObstacleSm(this._ctx, Game.PIXELS_PER_MOVE, 20, true),
            new WallObstacleSm(this._ctx, Game.PIXELS_PER_MOVE, 100, true),
            new WallObstacleMd(this._ctx, Game.PIXELS_PER_MOVE, 180, true),
            new WallObstacleLg(this._ctx, Game.PIXELS_PER_MOVE, 25, false),
            new WallObstacleMd(this._ctx, Game.PIXELS_PER_MOVE, 50, false),
            new WallObstacleSm(this._ctx, Game.PIXELS_PER_MOVE, 100, false),
            new WallObstacleLg(this._ctx, Game.PIXELS_PER_MOVE, 120, false)
        ];
        var player = new Player(this._ctx, Game.PIXELS_PER_MOVE);
        window.addEventListener("keydown", function (evt) {
            if (evt.keyCode == 38) {
                player.startJump();
            }
        }, true);
        window.addEventListener("keyup", function (evt) {
            if (evt.keyCode == 38) {
                player.endJump();
            }
        }, true);
        //Perform initial renderings (before we start moving the screen).
        player.render();
        setInterval(function () {
            //Clear screen.
            _this._ctx.clearRect(0, 0, _this._canvas.width, _this._canvas.height);
            //Render all obstacles.
            for (var _i = 0, obstacles_1 = obstacles; _i < obstacles_1.length; _i++) {
                var o = obstacles_1[_i];
                if (o.isStarted || o.order <= _this._currentTimeUnit) {
                    o.moveObstacle();
                    o.render();
                }
            }
            //Render player.
            player.render();
            //Increment current time unit.
            _this._currentTimeUnit++;
        }, Game.MILLISEC_PER_MOVE);
    };
    Game.PIXELS_PER_MOVE = 10;
    Game.MILLISEC_PER_MOVE = 50;
    return Game;
}());
var RenderableItem = (function () {
    function RenderableItem(ctx, pixelsPerMove, x, y, w, h) {
        this._ctx = ctx;
        this._x = x; //Left x
        this._y = y; //Bottom y
        this._w = w;
        this._h = h;
        this._pixelsPerMove = pixelsPerMove;
    }
    return RenderableItem;
}());
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(ctx, pixelsPerMove) {
        //Calculate starting X,Y coordinates. All players start visible, toward the left bottom of the screen.
        var y = ctx.canvas.height - Player.PLAYER_HEIGHT - Player.PLAYER_Y_COORD_OFFSET;
        _super.call(this, ctx, pixelsPerMove, Player.PLAYER_X_COORD, y, Player.PLAYER_WIDTH, Player.PLAYER_HEIGHT);
        this._normalY = y;
        this._isJumping = false;
    }
    Player.prototype.render = function () {
        //Check for jump status.
        if (this._isJumping) {
            this._y -= this._pixelsPerMove;
        }
        else {
            if (this._y < this._normalY) {
                this._y += this._pixelsPerMove;
            }
        }
        this._ctx.fillStyle = Player.PLAYER_COLOR;
        this._ctx.fillRect(this._x, this._y, this._w, this._h);
    };
    Player.prototype.startJump = function () {
        this._isJumping = true;
    };
    Player.prototype.endJump = function () {
        this._isJumping = false;
    };
    Player.PLAYER_X_COORD = 100;
    Player.PLAYER_Y_COORD_OFFSET = 2;
    Player.PLAYER_WIDTH = 20;
    Player.PLAYER_HEIGHT = 20;
    Player.PLAYER_COLOR = "red";
    return Player;
}(RenderableItem));
var Obstacle = (function (_super) {
    __extends(Obstacle, _super);
    function Obstacle(ctx, pixelsPerMove, w, h, order, isTop) {
        //Calculate starting X,Y coordinates. All obsticals start off the right edge.
        var x = ctx.canvas.width + 10;
        var y = isTop ? 0 : ctx.canvas.height - h; //Determine Y coordinate based on if it is a top or bottom obstacle.
        _super.call(this, ctx, pixelsPerMove, x, y, w, h);
        this._order = order;
        this._isStarted = false;
        this._isActive = true;
    }
    Obstacle.prototype.moveObstacle = function () {
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
    };
    Object.defineProperty(Obstacle.prototype, "isActive", {
        get: function () {
            return this._isActive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Obstacle.prototype, "isStarted", {
        get: function () {
            return this._isStarted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Obstacle.prototype, "order", {
        get: function () {
            return this._order;
        },
        set: function (value) {
            this._order = value;
        },
        enumerable: true,
        configurable: true
    });
    return Obstacle;
}(RenderableItem));
var WallObstacle = (function (_super) {
    __extends(WallObstacle, _super);
    function WallObstacle(ctx, pixelsPerMove, wallWidth, wallHeight, wallColor, order, isTop) {
        _super.call(this, ctx, pixelsPerMove, wallWidth, wallHeight, order, isTop);
        this._wallColor = wallColor;
    }
    WallObstacle.prototype.render = function () {
        this._ctx.fillStyle = this._wallColor;
        this._ctx.fillRect(this._x, this._y, this._w, this._h);
    };
    return WallObstacle;
}(Obstacle));
var WallObstacleLg = (function (_super) {
    __extends(WallObstacleLg, _super);
    function WallObstacleLg(ctx, pixelsPerMove, order, isTop) {
        _super.call(this, ctx, pixelsPerMove, WallObstacleLg.WALL_WIDTH, WallObstacleLg.WALL_HEIGHT, WallObstacleLg.WALL_COLOR, order, isTop);
    }
    WallObstacleLg.WALL_WIDTH = 50;
    WallObstacleLg.WALL_HEIGHT = 200;
    WallObstacleLg.WALL_COLOR = "yellow";
    return WallObstacleLg;
}(WallObstacle));
var WallObstacleMd = (function (_super) {
    __extends(WallObstacleMd, _super);
    function WallObstacleMd(ctx, pixelsPerMove, order, isTop) {
        _super.call(this, ctx, pixelsPerMove, WallObstacleMd.WALL_WIDTH, WallObstacleMd.WALL_HEIGHT, WallObstacleMd.WALL_COLOR, order, isTop);
    }
    WallObstacleMd.WALL_WIDTH = 50;
    WallObstacleMd.WALL_HEIGHT = 100;
    WallObstacleMd.WALL_COLOR = "blue";
    return WallObstacleMd;
}(WallObstacle));
var WallObstacleSm = (function (_super) {
    __extends(WallObstacleSm, _super);
    function WallObstacleSm(ctx, pixelsPerMove, order, isTop) {
        _super.call(this, ctx, pixelsPerMove, WallObstacleSm.WALL_WIDTH, WallObstacleSm.WALL_HEIGHT, WallObstacleSm.WALL_COLOR, order, isTop);
    }
    WallObstacleSm.WALL_WIDTH = 50;
    WallObstacleSm.WALL_HEIGHT = 50;
    WallObstacleSm.WALL_COLOR = "orange";
    return WallObstacleSm;
}(WallObstacle));

//# sourceMappingURL=gt.js.map
