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

    type: ig.Entity.TYPE.B,

    size: {
      x: 16,
      y: 28
    },

    offset: {
      x: 8,
      y: 4
    },

    animSheet: null,

    init: function(x, y, settings) {
      this.connection = window.gameRoom.roomConnection;
      this.animSheet = new ig.AnimationSheet(localStorage.getItem('player2image'), 32, 32);
      this.friction.y = 0;
      this.parent(x, y, settings);
      this.idleTimer = new ig.Timer();
      this.highJumpTimer = new ig.Timer();
      this.addAnim('idle', 1, [0]);
      this.addAnim('scratch', 0.3, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], true);
      // this.addAnim('shrug', 0.3, [3, 3, 3, 3, 3, 3, 4, 3, 3], true);
      this.addAnim('shoot', 0.1, [12, 13.5, 15, 16.5]);
      this.addAnim('run', 0.07, [24, 25, 26, 27, 28, 29, 30, 31]);
      this.addAnim('jump', 0.1, [38]);
      this.addAnim('fall', 0.4, [40]);
      this.addAnim('land', 0.15, [37]);
      this.addAnim('jumpshoot', 0.1, [48, 49.5, 51, 52.5, 54])
      this.addAnim('runshoot', 0.1, [16.5]);
      this.addAnim('die', 0.05, [60, 61, 62, 63, 64, 65, 66, 67, 68, 69]);
      this.addAnim('spawn', 0.05, [72, 73, 74, 75, 76, 77, 78, 79, 80, 81]);
      this.currentAnim = this.anims.spawn
    },
    setState: function(state) {
      var x = state.getX() / 10;
      var y = state.getY() / 10;
      this.dx = state.getVelX() / 10; //x - this.pos.x;
      this.dy = state.getVelY() / 10; //y - this.pos.y;
      this.pos = {
        x: x,
        y: y
      };
      this.currentAnim = this.getAnimById(state.getAnim());
      this.currentAnim.frame = state.getFrame();
      this.currentAnim.flip.x = !!state.getFlip();
    },
    update: function() {
      if (this.stateUpdated) {
        this.stateUpdated = false;
      } else {
        this.pos.x += this.dx;
        this.pos.y += this.dy;
        if (this.currentAnim) {
          this.currentAnim.update();
        }
      }
    },
    kill: function() {
      this.connection.updateBalance()
      this.parent();
    }
  });
  

});

} catch (error) {
  console.error(error)
}