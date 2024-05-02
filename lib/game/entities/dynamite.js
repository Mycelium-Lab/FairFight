ig.module(
    'game.entities.dynamite'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityDynamiteStatic = ig.Entity.extend({
        size:{ x: 32, y: 52},
        checkAgainst: ig.Entity.TYPE.A,
        animSheet: new ig.AnimationSheet('../media/sprites/dynamite.png',64,64),
        init: function(x,y,settings){
            this.parent(x,y,settings);
            this.addAnim('idle', 0.2, [0,1,2,3,4,5]);
        },
        check: function(other){
            ig.game.onPlayerCollectedDynamiteStatic(this);
        },
        update: function(){
            this.currentAnim.update();
        }
    });

    EntityDynamite = ig.Entity.extend({
        size: {
          x: 32,
          y: 52
        },
        offset: {
          x: 2,
          y: 4
        },
        maxVel: {
          x: 450,
          y: 450
        },
        gravityFactor: 0,
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.B,
        collides: ig.Entity.COLLIDES.NEVER,
        flip: false,
        hasHit: false,
        animSheet: new ig.AnimationSheet('../media/sprites/dynamite.png', 64, 64),
        arcRadius: 500, // радиус арки
        angle: 0, // угол
        angularVelocity: 0.3, // скорость изменения угла
        isMovingUp: true,

        init: function(x, y, settings) {
          this.parent(x, y, settings);
        //   this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
          this.addAnim('idle', 1, [0]);
          this.addAnim('hit', 0.4, [6, 7, 8, 9, 10, 11, 12, 13], true);
        },
        update: function() {
            // Добавим арку движения
            this.angle += this.angularVelocity;
            var radians = this.angle * (Math.PI / 180); // переводим угол в радианы
            var xVelocity = Math.cos(radians) * this.maxVel.x;
            var yVelocity = Math.sin(radians) * this.maxVel.y;
    
            // Учитываем гравитацию только если движемся вниз
            if (this.vel.y >= 0) {
                this.vel.y += ig.game.gravity * ig.system.tick;
            }
    
            // Установим новые координаты сущности с учётом дугового движения
            this.vel.x = (this.flip ? -xVelocity : xVelocity);
            this.vel.y = -yVelocity; // Всегда двигаемся вверх
    
            // Если достигли середины траектории, начинаем планомерное падение
            if (this.pos.y < ig.system.height / 2) {
                this.vel.y = yVelocity;
            }
    
            if (this.hasHit && this.currentAnim.loopCount > 0) {
                this.kill();
            }
    
            this.parent();
            this.currentAnim.flip.x = this.flip;
        },
        
        handleMovementTrace: function(res) {
          this.parent(res);
          if (res.collision.x || res.collision.y) {
            console.log('hit');
            this.currentAnim = this.anims.hit;
            this.hasHit = true;
          }
        },
        check: function(other) {
          if (!this.hasHit) {
            this.hasHit = true;
            this.currentAnim = this.anims.hit;
            this.vel.x = 0;
          }
        }
      });
    
      EntityDynamiteRemote = EntityDynamite.extend({
        checkAgainst: ig.Entity.TYPE.BOTH,
        check: function(other) {
            if (!this.hasHit) {
                var distance = this.distanceTo(ig.game.player);
                if (distance <= 40) {
                    ig.game.player.receiveDamage(20, this);
                    this.hasHit = true
                }
            }
        }
      });
})
