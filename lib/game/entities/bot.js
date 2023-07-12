// jscs:disable validateIndentation
ig.module(
    'game.entities.bot'
).requires(
    'impact.entity',
    'game.entities.particle',
    'game.entities.player',
    'net.room-connection',
    'game.events'
).defines(async function() {
    let lastUpdate = 0
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
        speed: 240,
        jump: 240,
        bounciness: 0,
        health: 30,
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
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
        previousPositionPlayer: {x: 0, y: 0},
        previousPosition: {x: 0, y: 0},
        targetCoordinates: [],
        path: null,
        init: async function(x, y, settings) {
                // let map = ig.game.collisionMap.data.map(row => [...row])
                // for (let i = 0; i < map.length; i++) {
                //     for (let j = 0; j < map[i].length; j++) {
                //       map[i][j] = map[i][j] === 1 ? 0 : 1;
                //     }
                // }
                // map = increaseCollisionMapSize(map, 32, 32);
                // this.grid = new Graph(map);
                this.mapID = settings.mapID
                this.animSheet = new ig.AnimationSheet(settings.image, 152, 152);
                this.parent(x, y, settings)
                this.shootingTimer = new ig.Timer();
                this.addAnim('idle', 1, [0]);
                this.addAnim('shoot', 0.1, [1, 2, 3]);
                this.addAnim('run', 0.07, [25, 26, 27, 28, 29, 30, 31]);
                this.currentAnim = this.anims.run
            },

            update: function() {
              this.parent();
              
              // Если есть целевые координаты
              if (this.targetCoordinates.length > 0) {
                // Получаем текущие координаты бота
                var currentPosition = { x: this.pos.x, y: this.pos.y };
                this.previousPosition = {...currentPosition}
                // Получаем координаты следующей точки в массиве
                var nextPosition = this.targetCoordinates[0];
                if (nextPosition.x > this.previousPosition.x) {
                  this.currentAnim.flip.x = false;
                  this.accel.x = -(this.standing ? this.accelDef.ground : this.accelDef.air);
                  this.offset.x = 29
                  this.flip = true;
                  this.moved = true;
                  this.currentAnim = this.anims.run
                } else if (nextPosition.x < this.previousPosition.x) {
                  this.currentAnim.flip.x = true;
                  this.accel.x = (this.standing ? this.accelDef.ground : this.accelDef.air);
                  this.offset.x = 70
                  this.flip = false;
                  this.moved = true;
                  this.currentAnim = this.anims.run
                } else if (Math.floor(nextPosition.x) === Math.floor(this.previousPosition.x)) {
                  this.currentAnim = this.anims.idle
                }
                
                // Вычисляем вектор направления движения
                var directionVector = {
                  x: nextPosition.x - currentPosition.x,
                  y: nextPosition.y - currentPosition.y
                };
                
                // Вычисляем дистанцию между текущей позицией и следующей точкой
                var distance = Math.sqrt(directionVector.x * directionVector.x + directionVector.y * directionVector.y);
                
                // Если достигли следующей точки
                if (distance <= this.speed * ig.system.tick) {
                  // Удаляем текущую точку из массива
                  this.targetCoordinates.shift();
                  
                  // Если больше нет точек, останавливаем бота
                  if (this.targetCoordinates.length === 0) {
                    this.vel.x = 0;
                    this.vel.y = 0;
                    return;
                  }
                  
                  // Обновляем текущие и следующие позиции
                  currentPosition = { x: this.pos.x, y: this.pos.y };
                  nextPosition = this.targetCoordinates[0];
                  
                  // Вычисляем новый вектор направления движения
                  directionVector = {
                    x: nextPosition.x - currentPosition.x,
                    y: nextPosition.y - currentPosition.y
                  };
                  
                  // Обновляем дистанцию
                  distance = Math.sqrt(directionVector.x * directionVector.x + directionVector.y * directionVector.y);
                }
                
                // Нормализуем вектор направления движения
                directionVector.x /= distance;
                directionVector.y /= distance;
                
                // Устанавливаем скорость движения бота
                this.vel.x = directionVector.x * this.speed;
                this.vel.y = directionVector.y * this.speed;
              }
            },
              
            moveTo: function(target) {
              try {
                // var distance = this.distanceTo(target.x, target.y);
                // var directionX = (target.x - this.pos.x - this.size.x / 2) / distance;
                // var directionY = (target.y - this.pos.y - this.size.y / 2) / distance;

                // // Вычисляем вектор перемещения на каждом кадре
                // var velocityX = directionX * this.speed * ig.system.tick;
                // var velocityY = directionY * this.speed * ig.system.tick;

                // Перемещаем бота
                this.pos.x = target.x;
                this.pos.y = target.y;
              } catch (error) {
                console.log(error)
              }
            },
            distanceTo: function(x, y) {
                var dx = this.pos.x + this.size.x / 2 - x;
                var dy = this.pos.y + this.size.y / 2 - y;
                return Math.sqrt(dx * dx + dy * dy);
            }
    })
})

// function increaseCollisionMapSize(twoDimArray, width, height) {
//   let newArray = []
//   for (let i = 0; i < twoDimArray.length; i++) {
//       let _row = []
//       for (let j = 0; j < twoDimArray[i].length; j++) {
//           for (let k = 0; k < width; k++) {
//               _row.push(twoDimArray[i][j])
//           }
//       }
//       for (let j = 0; j < height; j++) {
//           newArray.push(_row)
//       }
//   }
//   return newArray
// }