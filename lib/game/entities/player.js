// jscs:disable validateIndentation
ig.module(
    'game.entities.player'
).requires(
    'impact.entity',
    'game.entities.particle',
    'net.room-connection',
    'game.events'
).defines(function() {
  EntityPlayer = ig.Entity.extend({
    MAX_WEAPONS: 8,
    size: {
      // x: 17,
      // y: 29.75
      x: 16,
      y: 28
    },
    offset: {
      x: 8,
      y: 4
    },
    maxVel: {
      x: 120,
      y: 480
    },
    accelDef: {
      ground: 400,
      air: 200
    },
    frictionDef: {
      ground: 400,
      air: 100
    },
    jump: 160,
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
    // sfxPlasma: new ig.Sound('media/sounds/plasma.ogg'),
    // sfxDie: new ig.Sound('media/sounds/die-respawn.ogg', false),
    animSheet: null,
    init: function(x, y, settings) {
      this.connection = window.gameRoom.roomConnection;
      this.connectionHandlers = {
        'jump_message': this.onJump,
      };
      Events.on(this.connection, this.connectionHandlers, this);
      this.animSheet = new ig.AnimationSheet('../media/sprites/Player.png', 32, 32);
      this.friction.y = 0;
      this.parent(x, y, settings);
      this.idleTimer = new ig.Timer();
      this.highJumpTimer = new ig.Timer();
      this.addAnim('idle', 1, [0]);
      this.addAnim('scratch', 0.3, [1.5, 3, 4.5, 6, 0], true);
      // this.addAnim('shrug', 0.3, [3, 3, 3, 3, 3, 3, 4, 3, 3], true);
      this.addAnim('shoot', 0.1, [15, 16.5, 18, 19.5]);
      this.addAnim('run', 0.07, [30, 31.5, 33, 34.5, 36, 37.5, 39, 40.5, 42]);
      this.addAnim('jump', 0.1, [46.5]);
      this.addAnim('fall', 0.4, [51]);
      this.addAnim('land', 0.15, [49.5]);
      this.addAnim('jumpshoot', 0.1, [60, 61.5, 63, 64.5, 66])
      this.addAnim('die', 0.05, [75, 76.5, 78, 79.5, 81, 82.5, 84, 85.5, 87, 88.5]);
      // this.addAnim('spawn', 1, [16, 16, 16, 23, 22, 21, 20, 19, 18]);
    },
    update: function() {
      // If spawns - wait for spawn animation finished
      // then goto Idle
      if (this.currentAnim == this.anims.spawn) {
        this.currentAnim.update();
        if (this.currentAnim.loopCount) {
          this.currentAnim = this.anims.idle.rewind();
        } else {
          return;
        }
      }
      // Same for Die, but at the end of animation
      // do die ))
      if (this.currentAnim == this.anims.die) {
        this.currentAnim.update();
        if (this.currentAnim.loopCount) {
          this.kill();
        }
        return;
      }
      this.moved = false;
      this.friction.x = this.standing ? this.frictionDef.ground : this.frictionDef.air;

      // left or right button is pressed ( or holding )
      // set x-axis acceleration
      if (ig.input.state('left')) {
        this.accel.x = -(this.standing ? this.accelDef.ground : this.accelDef.air);
        this.flip = true;
        this.moved = true;
      } else if (ig.input.state('right')) {
        this.accel.x = (this.standing ? this.accelDef.ground : this.accelDef.air);
        this.flip = false;
        this.moved = true;
      } else {
        this.accel.x = 0;
      }

      // fire button pressed
      if (ig.input.pressed('shoot')) {
        // if (!this.standing) {
        //   this.currentAnim = this.anims.jumpshoot;
        //   this.currentAnim.update();
        // } else {
          this.currentAnim = this.anims.shoot;
          setTimeout(() => {
            this.currentAnim = this.anims.idle;
          }, 400)
          this.currentAnim.update();
        // }
        if (this.weaponsLeft > 0) {
          this.weaponsLeft--;
          ig.game.playerShoot();
          this.currentAnim = this.anims.shoot;
          setTimeout(() => {
            this.currentAnim = this.anims.idle;
          }, 400)
          this.currentAnim.update();
        }
        // this.sfxPlasma.play();
      }
      this.wantsJump = this.wantsJump || ig.input.pressed('jump');
      if (this.standing && (ig.input.pressed('jump') ||
          (!this.wasStanding && this.wantsJump && ig.input.state('jump')))) {
        ig.mark('jump');
        this.wantsJump = false;
        this.canHighJump = true;
        this.highJumpTimer.set(0.14);
        this.vel.y = -this.jump / 4;
        this.connection.playerJump()
      } else if (this.canHighJump) {
        var d = this.highJumpTimer.delta();
        if (ig.input.state('jump')) {
          var f = Math.max(0, d > 0 ? ig.system.tick - d : ig.system.tick);
          this.vel.y -= this.jump * f * 6.5;
        } else {
          this.canHighJump = false;
        }
        if (d > 0) {
          this.canHighJump = false;
        }
        this.connection.playerJump()
      }
      this.wasStanding = this.standing;
      this.parent();
      this.setAnimation();
    },
    setAnimation: function() {
      if ((!this.wasStanding && this.standing)) {
        this.currentAnim = this.anims.land.rewind();
      } else if (this.standing && (this.currentAnim != this.anims.land ||
          this.currentAnim.loopCount > 0)) {
        if (this.moved) {
          if (this.standing) {
            this.currentAnim = this.anims.run;
          }
          this.idle = false;
        } else {
          if (!this.idle || this.currentAnim.stop && this.currentAnim.loopCount > 0) {
            this.idle = true;
            this.idleTimer.set(Math.random() * 4 + 3);
            this.currentAnim = this.anims.idle;
          }
          if (this.idleTimer.delta() > 0) {
            this.idleTimer.reset();
            this.currentAnim = this.anims.scratch.rewind();
          }
        }
      } else if (!this.standing) {
        if (ig.input.pressed('shoot')) {
          this.currentAnim = this.anims.jumpshoot;
          this.isJumpShoot = true;
          setTimeout(() => {
            this.isJumpShoot = false
            if (this.vel.y < 0) {
              this.currentAnim = this.anims.jump;
            } else {
              if (this.currentAnim != this.anims.fall) {
                this.anims.fall.rewind();
              }
              this.currentAnim = this.anims.fall;
            }
          }, 500) //delete if not exist anymore
        } else if (this.isJumpShoot == false){
          if (this.vel.y < 0) {
            this.currentAnim = this.anims.jump;
          } else {
            if (this.currentAnim != this.anims.fall) {
              this.anims.fall.rewind();
            }
            this.currentAnim = this.anims.fall;
          }
        }
        this.idle = false;
      }
      this.currentAnim.flip.x = this.flip;
      // if (this.flip) {
      //   this.currentAnim.tile += this.flippedAnimOffset;
      // }
    },
    collideWith: function(other, axis) {
      if (axis == 'y' && this.standing && this.currentAnim != this.anims.die) {
        this.currentAnim.update();
        this.setAnimation();
      }
    },
    receiveDamage: function(amount, from) {
      this.health -= amount;
      if (this.health > 0) {
        return;
      }
      if (from.userId) {
        this.killerId = from.userId;
      }
      if (this.currentAnim != this.anims.die) {
        this.currentAnim = this.anims.die.rewind();
        for (var i = 0; i < 3; i++) {
          ig.game.spawnEntity(EntityPlayerGib, this.pos.x, this.pos.y);
        }
        ig.game.spawnEntity(EntityPlayerGibGun, this.pos.x, this.pos.y);
        // this.sfxDie.play();
      }
    },
    kill: function() {
      ig.game.playerDied(this.killerId);
      this.parent();
    },
    addWeapons: function(weaponsCount) {
      this.weaponsLeft = Math.min(this.MAX_WEAPONS, this.weaponsLeft + weaponsCount);
    },
    onJump: function() {

    }
  });
  EntityPlayerGib = EntityParticle.extend({
    lifetime: 0.8,
    fadetime: 0.4,
    friction: {
      x: 0,
      y: 0
    },
    vel: {
      x: 30,
      y: 80
    },
    gravityFactor: 0,
    animSheet: new ig.AnimationSheet('../media/sprites/Player.png', 8, 8),
    init: function(x, y, settings) {
      this.addAnim('idle', 7, [82, 94]);
      this.parent(x, y, settings);
    },
    update: function() {
      this.parent();
    }
  });
  EntityPlayerGibGun = EntityParticle.extend({
    lifetime: 2,
    fadetime: 0.4,
    size: {
      x: 8,
      y: 8
    },
    friction: {
      x: 30,
      y: 0
    },
    vel: {
      x: 60,
      y: 50
    },
    animSheet: new ig.AnimationSheet('../media/sprites/Player.png', 8, 8),
    init: function(x, y, settings) {
      this.addAnim('idle', 0.5, [11]);
      this.parent(x, y, settings);
      this.currentAnim.flip.y = false;
    }
  });
  EntityProjectile = ig.Entity.extend({
    size: {
      x: 12,
      y: 6
    },
    offset: {
      x: 2,
      y: 4
    },
    maxVel: {
      x: 300,
      y: 0
    },
    gravityFactor: 0,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NEVER,
    flip: false,
    hasHit: false,
    animSheet: new ig.AnimationSheet('../media/sprites/projectile2.png', 16, 16),
    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
      this.addAnim('idle', 1, [0]);
      this.addAnim('hit', 0.2, [1, 2, 3, 4, 5], true);
    },
    update: function() {
      if (this.hasHit && this.currentAnim.loopCount > 0) {
        this.kill();
      }
      this.parent();
      this.currentAnim.flip.x = this.flip;
    },
    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x || res.collision.y) {
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

  EntityProjectileRemote = EntityProjectile.extend({
    checkAgainst: ig.Entity.TYPE.A,
    check: function(other) {
      if (!this.hasHit) {
        other.receiveDamage(10, this);
        this.hasHit = true;
        this.currentAnim = this.anims.hit;
        this.vel.x = 0;
      }
    }
  });

});
