// jscs:disable validateIndentation
try {
  
ig.module(
  'game.entities.remote-player'
)
.requires(
  'impact.entity',
  'game.entities.particle',
  'net.room-connection'
)
.defines(function() {
  EntityRemotePlayer = ig.Entity.extend({
    miniMap: { mapColor: '#FF0000', mapSize: ig.ua.mobile ? 4 : 18 },

    type: ig.Entity.TYPE.B,

    size: {
      x: 54,
      y: 50
    },

    offset: {
      x: 70,
      y: 102
    },

    lastPositiveX: 0,
    animSheet: null,

    init: function(x, y, settings) {
      this.connection = window.gameRoom.roomConnection;
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
    setState: function(state) {
      let _x = 0
      if (state.positionData.x > 0) {
        this.lastPositiveX = state.positionData.x
        _x = this.lastPositiveX
      } else {
        let _dx = this.lastPositiveX + state.positionData.x
        _x = this.lastPositiveX + _dx
      }
      var x = (_x / 10) ;
      if (state.positionData.flip) {
        this.offset.x = 29
      } else {
        this.offset.x = 70
      }
      var y = state.positionData.y / 10;
      this.dx = state.positionData.velX / 10; //x - this.pos.x;
      this.dy = state.positionData.velY / 10; //y - this.pos.y;
      // console.log('-----------------------------')
      // console.log(x, y)
      // console.log(state.positionData.x, state.positionData.y)
      // console.log(this.dx, this.dy)
      // console.log(state.positionData.velX, state.positionData.velY)
      // console.log('-----------------------------')
      this.pos = {
        x: state.positionData.x,
        y: state.positionData.y
      };
      if (state.positionData.animName == 'idle') {
        this.currentAnim = this.anims.idle
      }
      if (state.positionData.animName == 'scratch') {
        this.currentAnim = this.anims.scratch
      }
      if (state.positionData.animName == 'shoot') {
        this.currentAnim = this.anims.shoot
      }
      if (state.positionData.animName == 'run') {
        this.currentAnim = this.anims.run
      }
      if (state.positionData.animName == 'jump') {
        this.currentAnim = this.anims.jump
      }
      if (state.positionData.animName == 'fall') {
        this.currentAnim = this.anims.fall
      }
      if (state.positionData.animName == 'land') {
        this.currentAnim = this.anims.land
      }
      if (state.positionData.animName == 'jumpshoot') {
        this.currentAnim = this.anims.jumpshoot
      }
      if (state.positionData.animName == 'runshoot') {
        this.currentAnim = this.anims.runshoot
      }
      if (state.positionData.animName == 'die') {
        this.currentAnim = this.anims.die
      }
      if (state.positionData.animName == 'spawn') {
        this.currentAnim = this.anims.spawn
      }
      this.currentAnim.frame = state.positionData.frame;
      this.currentAnim.flip.x = !!state.positionData.flip;
    },
    update: function() {
      if (this.stateUpdated) {
        this.stateUpdated = false;
      } else {
        // this.pos.x += this.dx;
        // this.pos.y += this.dy;
        if (this.currentAnim) {
          this.currentAnim.update();
        }
      }
    },
    setKill: function() {
      let flip = this.currentAnim.flip.x
      this.currentAnim = this.anims.die
      this.currentAnim.flip.x = flip
      // this.parent();
    },
    kill: function() {
      this.currentAnim = this.anims.die
      // this.connection.updateBalance()
      this.parent();
    }
  });
  

});

} catch (error) {
  console.error(error)
}