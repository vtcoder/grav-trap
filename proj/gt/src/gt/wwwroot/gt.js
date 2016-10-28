var ObstacleBase = (function () {
    function ObstacleBase(ctx) {
        this.ctx = ctx;
    }
    ObstacleBase.prototype.render = function () {
        this.ctx.fillRect(5, 5, 50, 50);
    };
    return ObstacleBase;
}());
var Game = (function () {
    function Game(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
    }
    Game.prototype.start = function (canvas) {
        var o = new ObstacleBase(this.ctx);
        o.render();
    };
    return Game;
}());

//# sourceMappingURL=gt.js.map
