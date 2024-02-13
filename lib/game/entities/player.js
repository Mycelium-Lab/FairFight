// jscs:disable validateIndentation
ig.module(
    'game.entities.player'
).requires(
    'impact.entity',
    'game.entities.particle',
    'net.room-connection',
    'game.events'
).defines(async function() {
  EntityPlayer = ig.Entity.extend({
    miniMap: { mapColor: '#0000FF', mapSize: ig.ua.mobile ? 4 : 18 },
    MAX_WEAPONS: 8,
    size: {
      // x: 17,
      // y: 29.75
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
    // sfxPlasma: new ig.Sound('media/sounds/plasma.ogg'),
    // sfxDie: new ig.Sound('media/sounds/die-respawn.ogg', false),
    animSheet: null,
    count: 0,
    packageNum: 1,
    init: async function(x, y, settings) {
      this.mapID = settings.mapID
      this.setAmmunition(this.weaponsLeft);
      this.setHealth(this.health);
      this.connection = window.gameRoom.roomConnection;
      this.connectionHandlers = {
        'jump_message': this.onJump,
      };
      Events.on(this.connection, this.connectionHandlers, this);
      this.animSheet = new ig.AnimationSheet(settings.image, 152, 152);
      this.friction.y = 0;
      this.parent(x, y, settings);
      this.idleTimer = new ig.Timer();
      this.highJumpTimer = new ig.Timer();
      this.addAnim('idle', 1, [0]);
      this.addAnim('scratch', 0.2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], true);
      // this.addAnim('shrug', 0.3, [3, 3, 3, 3, 3, 3, 4, 3, 3], true);
      this.addAnim('shoot', 0.3, [12.015, 13.015, 14.015, 15.015]);
      this.addAnim('run', 0.07, [25, 26, 27, 28, 29, 30, 31]);
      this.addAnim('jump', 0.1, [38]);
      this.addAnim('fall', 0.4, [40]);
      this.addAnim('land', 0.15, [11]);
      this.addAnim('jumpshoot', 0.1, [49, 50, 51, 52])
      this.addAnim('runshoot', 0.1, [16.5]);
      this.addAnim('die', 0.05, [61, 62, 63, 64, 65, 66, 67, 68, 69]);
      this.addAnim('spawn', 0.05, [81, 80, 79, 78, 77, 76, 75, 74, 73], true);
      this.currentAnim = this.anims.spawn
    },
    update: function() {
      if (this.mapID == 1) {
        let parsedY = parseInt(this.pos.y)
        let parsedX = parseInt(this.pos.x)
        if(parsedY >= 1480 && parsedX >= 1940 && parsedX <= 2100) {
          this.currentAnim = this.anims.spawn
          this.pos.x = 2020
          this.pos.y = 20
        }
        if(parsedY >= 1480 && parsedX >= 320 && parsedX <= 452) {
          this.currentAnim = this.anims.spawn
          this.pos.x = 200
          this.pos.y = 20
        }
        if(parsedY >= 1140 && parsedY <= 1200 && parsedX >= 980 && parsedX <= 1140) {
          this.currentAnim = this.anims.spawn
          this.pos.x = 3080
          this.pos.y = 322
        }
        if(parsedY >= 1140 && parsedY <= 1200 && parsedX >= 2980 && parsedX <= 3140) {
          this.currentAnim = this.anims.spawn
          this.pos.x = 1060
          this.pos.y = 322
        }
        if(parsedY >= 1480 && parsedX >= 3520 && parsedX <= 3700) {
          this.currentAnim = this.anims.spawn
          this.pos.x = 3870
          this.pos.y = 20
        }
      }
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
        this.offset.x = 29
        this.flip = true;
        this.moved = true;
      } else if (ig.input.state('right')) {
        this.accel.x = (this.standing ? this.accelDef.ground : this.accelDef.air);
        this.offset.x = 70
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
          this.setAmmunition(this.weaponsLeft);
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
        // this.connection.playerJump()
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
        // this.connection.playerJump()
      }
      this.wasStanding = this.standing;
      this.parent();
      this.setAnimation();
      let animName = 'idle'
      if (this.currentAnim == this.anims.idle) {
        animName = 'idle'
      }
      if (this.currentAnim == this.anims.scratch) {
        animName = 'scratch'
      }
      if (this.currentAnim == this.anims.shoot) {
        animName = 'shoot'
      }
      if (this.currentAnim == this.anims.run) {
        animName = 'run'
      }
      if (this.currentAnim == this.anims.jump) {
        animName = 'jump'
      }
      if (this.currentAnim == this.anims.fall) {
        animName = 'fall'
      }
      if (this.currentAnim == this.anims.land) {
        animName = 'land'
      }
      if (this.currentAnim == this.anims.jumpshoot) {
        animName = 'jumpshoot'
      }
      if (this.currentAnim == this.anims.runshoot) {
        animName = 'runshoot'
      }
      if (this.currentAnim == this.anims.die) {
        animName = 'die'
      }
      if (this.currentAnim == this.anims.spawn) {
        animName = 'spawn'
      }
      this.packageNum += 1
      // if (this.packageNum % 2 == 0) {
        this.connection.emit('movement', {
          time: Date.now(),
          flip: this.flip,
          velY: (this.pos.y - this.last.y) ,
          velX: (this.pos.x - this.last.x) ,
          // velY: this.vel.y,
          // velX: this.vel.x,
          frame: this.currentAnim.frame,
          animName: animName,
          x: this.pos.x,
          y: this.pos.y,
          time: Date.now(),
          packageNum: this.packageNum
        })
      // }
      // console.log(this.pos.x, this.pos.y)
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
      this.setHealth(this.health);
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
      this.connection.emit('player_died', this.killerId)
      this.connection.socket.emit('user_update_balance')
      ig.game.playerDied(this.killerId);
      this.parent();
    },
    addWeapons: function(weaponsCount) {
      this.weaponsLeft = Math.min(this.MAX_WEAPONS, this.weaponsLeft + weaponsCount);
      this.setAmmunition(this.weaponsLeft);
    },
    onJump: function() {

    },
    setAmmunition: function (amount) {
      const ammunition = document.getElementsByClassName('ammunition')
      for (let i = 0; i < 2; i++) {
        try {
          /*const statsValue = document.querySelectorAll('.you-stats-value-item')
          const statsValueArr = Array.from(statsValue)
          console.log('statsValue', statsValue)

          console.log(amount, statsValueArr[0])
          if(amount > 10 && statsValueArr[0].textContent.length > 1) {
            console.log('1')
            statsValueArr.filter(v => v.textContent.length === 1).forEach(v => {
              v.style.marginRight = '10px'
            }) 
        }
        else if(amount > 10 && statsValueArr[0].textContent.length === 1) {
           console.log('2')
          statsValueArr.filter(v => v.textContent.length === 1).forEach(v => {
            v.style.marginRight = '18px'
          }) 
        }
        else if (amount < 10 && statsValueArr[0].textContent.length > 1) {
           console.log('3')
          statsValueArr.filter(v => v.textContent.length === 1).forEach(v => {
            v.style.marginRight = '10px'
          }) 
        }
        else if(amount < 10 && statsValueArr[0].length === 1) {
           console.log('4')
          statsValueArr.filter(v => v.textContent.length === 1).forEach(v => {
            v.style.marginRight = '0px'
          }) 
        }*/
          ammunition.item(i).textContent = amount;
        } catch (error) {
          
        }
      }
    },
    setHealth: function (amount) {
      const health = document.getElementsByClassName('yourHealth')
      amount = amount / 10
      for (let i = 0; i < 2; i++) {
        try {

          if(amount > 0) {
            health.item(i).textContent = amount
            if(!isSetMock)
            document.getElementsByClassName('yourHealth')
          } 
          else if (amount < 0 ) {
            health.item(i).textContent = amount
          }
        else if (data.kills < 10) {
            enemyKills.item(i).textContent = data.kills
        }
         else if (data.kills >= 10 && data.deaths < 10) {
            document.getElementsByClassName('enemyDeaths__mock').textContent = 0
            enemyKills.item(i).textContent = data.kills
        }



          health.item(i).textContent = amount > 0 ? amount : 0
        } catch (error) {
          
        }
      }
    },
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
      x: 24,
      y: 12
    },
    offset: {
      x: 2,
      y: 4
    },
    maxVel: {
      x: 450,
      y: 0
    },
    gravityFactor: 0,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NEVER,
    flip: false,
    hasHit: false,
    animSheet: new ig.AnimationSheet('../media/sprites/projectile.png', 32, 32),
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
    animSheet: new ig.AnimationSheet('../media/sprites/projectile2.png', 32, 32),
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
