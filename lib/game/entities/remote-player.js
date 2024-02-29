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
    prevPos: {x: 0, y: 0},
    newPos: {x: 0, y: 0},
    velocity: {x: 0, y: 0},
    prevTime: 0,
    newTime: 0,
    count: 0,
    locationOld: {x: 0, y: 0},
    locationNew: {x: 0, y: 0},
    locationCurrent: {x: 0, y: 0},
    updateOldLocation: false,
    locationWaiting: {x: 0, y: 0},
    InterpTime: 0.16,
    InterpTimeCurrent: 0.0,
    lastPackageNum: 0,
    totalDelayTime: 0,
    numMessages: 0,
    tolerance: 2,
    waitingAnim: null,
    waitingFrame: null,
    waitingFlipX: null,

    init: function(x, y, settings) {
      this.connection = window.gameRoom.roomConnection;
      this.animSheet = new ig.AnimationSheet(settings.image, 152, 152);
      this.friction.y = 0;
      this.parent(x, y, settings);
      this.locationCurrent = {x, y}
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

    RcvNewLocation: function(rcvedLocation) {
      this.locationWaiting = rcvedLocation
      this.currentAnim = this.waitingAnim
      this.currentAnim.frame = this.waitingFrame
      this.currentAnim.flip.x = this.waitingFlipX
      // this.locationCurrent = this.locationNew;
      // this.locationNew = rcvedLocation;
      // this.InterpTimeCurrent = 0.0;
    },

    LerpVec2: function(from, to) {
        return {
            x: from.x * (1 - ig.system.tick) + to.x * ig.system.tick,
            y: from.y * (1 - ig.system.tick) + to.y * ig.system.tick
        };
    },

    UpdateLocation: function(deltaTime) {
      let xDifference = Math.abs(Math.floor(this.locationCurrent.x) - Math.floor(this.locationWaiting.x));
      let yDifference = Math.abs(Math.floor(this.locationCurrent.y) - Math.floor(this.locationWaiting.y));
      if (xDifference <= this.tolerance && yDifference <= this.tolerance) {
        this.locationCurrent = this.locationWaiting
      } else {
        this.locationCurrent = this.LerpVec2(this.locationCurrent, this.locationWaiting);
        this.InterpTimeCurrent += deltaTime;
      }
    },

    setState: function(state) {
      const weightTime = Date.now() - state.positionData.time
      this.totalDelayTime += weightTime
      this.numMessages++
      // this.InterpTime = this.totalDelayTime / this.numMessages / 1000
      if (this.lastPackageNum < state.positionData.packageNum) {
        this.lastPackageNum = state.positionData.packageNum
        this.RcvNewLocation({x: state.positionData.x, y: state.positionData.y});
        if (state.positionData.flip) {
          this.offset.x = 29
        } else {
          this.offset.x = 70
        }
        this.waitingAnim = this.anims[`${state.positionData.animName}`]
        this.waitingFrame = state.positionData.frame;
        this.waitingFlipX = !!state.positionData.flip;
      }
    },
    update: function() {
      if (this.stateUpdated) {
        this.stateUpdated = false;
      } else {
        this.UpdateLocation(ig.system.tick);
        this.pos.x = this.locationCurrent.x;
        this.pos.y = this.locationCurrent.y;
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