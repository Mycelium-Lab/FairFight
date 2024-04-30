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
    walletAddress: null,
    image: null,
    
    init: function(x, y, settings) {
      this.connection = window.gameRoom.roomConnection;
      this.walletAddress = settings.walletAddress
      this.image = settings.image
      this.animSheet = new ig.AnimationSheet(settings.image, 152, 152);
      // setTimeout(() => {
      //   this.animSheet.image = new ig.Image(this.image);
      // }, 10000)
      // setTimeout(() => {
      //   this.animSheet.image = new ig.Image('');
      // }, 20000)
      // setTimeout(() => {
      //   this.animSheet.image = new ig.Image(this.image);
      // }, 30000)
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
      this.addAnim('spawn', 0.05, [73, 74, 75, 76, 77, 78, 79, 80, 81]);
      this.currentAnim = this.anims.spawn
    },
    setState: function(state) {
      let _x = 0
      if (state.getX() > 0) {
        this.lastPositiveX = state.getX()
        _x = this.lastPositiveX
      } else {
        let _dx = this.lastPositiveX + state.getX()
        _x = this.lastPositiveX + _dx
      }
      var x = (_x / 10) ;
      if (state.getFlip()) {
        this.offset.x = 29
      } else {
        this.offset.x = 70
      }
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