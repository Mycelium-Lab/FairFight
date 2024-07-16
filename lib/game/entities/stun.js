ig.module(
    'game.entities.stun'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityStunStatic = ig.Entity.extend({
        size:{ x: 32, y: 52},
        checkAgainst: ig.Entity.TYPE.A,
        animSheet: new ig.AnimationSheet('../media/sprites/hammer.png',64,64),
        init: function(x,y,settings){
            this.parent(x,y,settings);
            this.addAnim('idle', 0.1, [0,1,2,3]);
        },
        check: function(other){
            ig.game.onPlayerCollectedStunStatic(this);
        },
        update: function(){
            this.currentAnim.update();
        }
    });

    EntityStun = ig.Entity.extend({
        size: {
          x: 32,
          y: 52
        },
        offset: {
          x: 12,
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
        animSheet: new ig.AnimationSheet('../media/sprites/hammer.png', 64, 64),
        arcRadius: 500, // радиус арки
        angle: 0, // угол
        angularVelocity: 0.3, // скорость изменения угла
        hitTimer: null,

        init: function(x, y, settings) {
          this.parent(x, y, settings);
        //   this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
          this.addAnim('idle', 1, [0]);
          this.addAnim('hit', 0.2, [4,5,6,7,8,9,10,11,12,13,14]);
          this.hitTimer = new ig.Timer(); // Инициализация таймера
        },
        update: function() {
            // Добавим арку движения
            if (!this.hasHit) {
                this.vel.x = (this.flip ? -this.maxVel.x : this.maxVel.x);
            } 
    
            if (this.hasHit) {
                if (this.hitTimer.delta() > 5) {
                    this.kill();
                }
            }
    
            this.parent();
            this.currentAnim.flip.x = this.flip;
        },
        
        handleMovementTrace: function(res) {
          this.parent(res);
          if (res.collision.x || res.collision.y) {
            this.currentAnim = this.anims.hit;
            this.hasHit = true;
            this.vel.x = 0
            this.vel.y = 0
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
    
      EntityStunRemote = EntityStun.extend({
        checkAgainst: ig.Entity.TYPE.BOTH,
        check: function(other) {
            if (!this.hasHit) {
                var distance = this.distanceTo(ig.game.player);
                if (distance <= 100) {
                    ig.input.bind(ig.KEY.A, '');
                    ig.input.bind(ig.KEY.D, '');
                    ig.input.bind(ig.KEY.W, '');
                    ig.input.bind(ig.KEY.SPACE, '');
                    ig.input.bindTouch( '#left-btn', '' );
                    ig.input.bindTouch( '#right-btn', '' );
                    ig.input.bindTouch( '#jump-btn', '' );
                    ig.input.bindTouch( '#attack-btn', '' );
                    setTimeout(() => {
                        ig.input.bind(ig.KEY.A, 'left');
                        ig.input.bind(ig.KEY.D, 'right');
                        ig.input.bind(ig.KEY.W, 'jump');
                        ig.input.bind(ig.KEY.SPACE, 'shoot');
                        ig.input.bindTouch( '#left-btn', 'left' );
                        ig.input.bindTouch( '#right-btn', 'right' );
                        ig.input.bindTouch( '#jump-btn', 'jump' );
                        ig.input.bindTouch( '#attack-btn', 'shoot' );
                    }, 5000)
                    this.hasHit = true
                    this.hitTimer.reset()
                }
            }
        }
      });
})
