// jscs:disable validateIndentation
ig.module(
    'game.entities.bot'
).requires(
    'impact.entity',
    'game.entities.particle',
    'net.room-connection',
    'game.events'
).defines(async function() {
    EntityBot = ig.Entity.extend({
        size: {
            x: 54,
            y: 50
        },
        offset: {
            x: 70,
            y: 102
        },
        maxVel: {
            x: 240,
            y: 920
        },
        accelDef: {
            ground: 400,
            air: 200
        },
        frictionDef: {
            ground: 400,
            air: 100
        },
        jump: 240,
        bounciness: 0,
        health: 30,
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
        flip: false,
        flippedAnimOffset: 20,
        idle: false,
        moved: false,
        wasStanding: false,
        canHighJump: false,
        highJumpTimer: null,
        idleTimer: null,
        weaponsLeft: 3,
        isJumpShoot: false,
        connection: null,
        mapID: 0,
        animSheet: null,
        shootingCooldown: 2,
        shootingTimer: null,
        grid: null,
        finder: null,
        path: null,
        init: async function(x, y, settings) {
                // Предположим, что ig.game.collisionMap.data содержит данные вашей карты столкновений
                const tileSize = 32; // Размер тайла в пикселях
                
                // Рассчитываем ширину и высоту сетки, исходя из размеров карты столкновений и размера тайла
                const gridWidth = ig.game.collisionMap.width * tileSize;
                const gridHeight = ig.game.collisionMap.height * tileSize;
                
                // Создаем сетку, учитывая новые размеры
                this.grid = new window.PF.Grid(gridWidth, gridHeight);
                console.log(this.grid)
                
                // Проходим по данным карты столкновений и устанавливаем состояние узлов в сетке
                for (let x = 0; x < ig.game.collisionMap.width; x++) {
                    for (let y = 0; y < ig.game.collisionMap.height; y++) {
                        // Проверяем состояние тайла в данных карты столкновений
                        const collisionValue = ig.game.collisionMap.data[y][x];
                    
                        // Рассчитываем позицию узла в сетке, исходя из размера тайла
                        const nodeX = x * tileSize;
                        const nodeY = y * tileSize;
                    
                        // Устанавливаем состояние узла в сетке
                        this.grid.setWalkableAt(nodeX, nodeY, collisionValue === 0); // Предполагаем, что 0 - это проходимый тайл
                    }
                }
                // Создаем экземпляр AStarFinder
                this.finder = new PF.AStarFinder();
                this.mapID = settings.mapID
                this.animSheet = new ig.AnimationSheet(settings.image, 152, 152);
                this.parent(x, y, settings)
                this.shootingTimer = new ig.Timer();
                this.addAnim('idle', 1, [0]);
                this.addAnim('shoot', 0.1, [1, 2, 3]);
                this.path = this.finder.findPath(
                    x, y, 
                    ig.game.player.pos.x , 
                    ig.game.player.pos.y , this.grid);
                console.log(x, y)
            },

            update: function() {
                console.log(Math.round(this.pos.x),Math.round(this.pos.y))
                if (ig.game.player) {
                  var path = this.finder.findPath(Math.round(this.pos.x),Math.round(this.pos.y), Math.round(ig.game.player.pos.x), Math.round(ig.game.player.pos.y), this.grid);
                //   console.log(path)
                  if (path && path.length > 1) {
                    var target = path[1]; // Возьмите следующую координату пути
                    this.moveTo(target);
                  }
                }
                this.parent();
              },
              
            moveTo: function(target) {
                var tileSize = 32; // Размер тайла в пикселях
                var targetX = target[0]
                var targetY = target[1]
              
                var angle = this.angleTo(targetX, targetY);
                this.vel.x = Math.cos(angle) * this.maxVel.x;
                this.vel.y = Math.sin(angle) * this.maxVel.y;
            }
    })
})