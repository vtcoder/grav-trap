var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Game = (function () {
    function Game(canvas) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
        this._bgStartingX = this._canvas.width + 10;
        this._bgStartingY = 0;
    }
    Game.prototype.start = function (canvas) {
        var _this = this;
        var o = new WallObstacle(this._ctx, this._bgStartingX, this._bgStartingY);
        o.render();
        setInterval(function () {
            _this._ctx.clearRect(0, 0, _this._canvas.width, _this._canvas.height);
            o.bgMove();
            o.render();
        }, 50);
    };
    return Game;
}());
var RenderableItem = (function () {
    function RenderableItem(ctx, x, y, w, h) {
        this._ctx = ctx;
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
    }
    RenderableItem.prototype.bgMove = function () {
        this._x -= 10;
    };
    return RenderableItem;
}());
var Obstacle = (function (_super) {
    __extends(Obstacle, _super);
    function Obstacle() {
        _super.apply(this, arguments);
    }
    return Obstacle;
}(RenderableItem));
var WallObstacle = (function (_super) {
    __extends(WallObstacle, _super);
    function WallObstacle(ctx, x, y) {
        _super.call(this, ctx, x, y, WallObstacle.WALL_WIDTH, WallObstacle.WALL_HEIGHT);
    }
    WallObstacle.prototype.render = function () {
        this._ctx.fillStyle = WallObstacle.WALL_COLOR;
        this._ctx.fillRect(this._x, this._y, this._w, this._h);
    };
    WallObstacle.WALL_WIDTH = 50;
    WallObstacle.WALL_HEIGHT = 200;
    WallObstacle.WALL_COLOR = "yellow";
    return WallObstacle;
}(Obstacle));

//# sourceMappingURL=gt.js.map
