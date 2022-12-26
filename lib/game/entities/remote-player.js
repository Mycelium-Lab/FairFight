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
      this.animSheet = new ig.AnimationSheet('../media/sprites/Player2.png', 32, 32);
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
      // this.addAnim('idle', 1, [0]);
      // this.addAnim('scratch', 0.3, [2, 1, 2, 1, 2], true);
      // this.addAnim('shrug', 0.3, [3, 3, 3, 3, 3, 3, 4, 3, 3], true);
      // this.addAnim('run', 0.07, [6, 7, 8, 9, 10, 11]);
      // this.addAnim('jump', 1, [15]);
      // this.addAnim('fall', 0.4, [12, 13]);
      // this.addAnim('land', 0.15, [14]);
      // this.addAnim('die', 0.07, [18, 19, 20, 21, 22, 23, 16, 16, 16]);
      // this.addAnim('spawn', 0.07, [16, 16, 16, 23, 22, 21, 20, 19, 18]);
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