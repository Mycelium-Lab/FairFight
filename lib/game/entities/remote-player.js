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
    InterpTime: 0.1,
    InterpTimeCurrent: 0.0,

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

    RcvNewLocation: function(rcvedLocation) {
        this.locationOld = this.locationNew;
        this.locationNew = rcvedLocation;
        this.InterpTimeCurrent = 0.0;
    },

    LerpVec2: function(from, to, alpha) {
        return {
            x: from.x + (to.x - from.x) * alpha,
            y: from.y + (to.y - from.y) * alpha
        };
    },

    UpdateLocation: function(deltaTime) {
        this.locationCurrent = this.LerpVec2(this.locationOld, this.locationNew, this.InterpTimeCurrent / this.InterpTime);
        this.InterpTimeCurrent += deltaTime;
    },

    setState: function(state) {
      this.RcvNewLocation({x: state.positionData.x, y: state.positionData.y});
      // let _x = 0
      // if (state.positionData.x > 0) {
      //   this.lastPositiveX = state.positionData.x
      //   _x = this.lastPositiveX
      // } else {
      //   let _dx = this.lastPositiveX + state.positionData.x
      //   _x = this.lastPositiveX + _dx
      // }
      // var x = (_x) ;
      // if (state.positionData.flip) {
      //   this.offset.x = 29
      // } else {
      //   this.offset.x = 70
      // }
      // var y = state.positionData.y;
      // // console.log('-----------------------------')
      // // console.log(x, y)
      // // console.log(state.positionData.x, state.positionData.y)
      // // console.log(this.dx, this.dy)
      // // console.log(state.positionData.velX, state.positionData.velY)
      // // console.log('-----------------------------')
      // const time = Date.now()
      // this.dx = state.positionData.velX ; //x - this.pos.x;
      // this.dy = state.positionData.velY ; //y - this.pos.y;
      // this.prevPos.x = this.newPos.x;
      // this.prevPos.y = this.newPos.y;
      // this.prevTime = this.newTime;
      // this.velocity.x = state.positionData.velX;
      // this.velocity.y = state.positionData.velY;

      // // Устанавливаем новые позиции и времена
      // this.newPos.x = state.positionData.x;
      // this.newPos.y = state.positionData.y;
      // this.newTime = Date.now();
      // this.pos = {
      //   x: x,
      //   y: y
      // };
      this.currentAnim = this.anims[`${state.positionData.animName}`]
      this.currentAnim.frame = state.positionData.frame;
      this.currentAnim.flip.x = !!state.positionData.flip;
    },
    update: function() {
      // console.log(this.count, 'update')
      if (this.stateUpdated) {
        this.stateUpdated = false;
      } else {
        this.UpdateLocation(ig.system.tick);
        // console.log(this.locationCurrent)
        this.pos.x = this.locationCurrent.x;
        this.pos.y = this.locationCurrent.y;
        // if (this.newTime > this.prevTime) {
        //   // Вычисляем прогресс интерполяции от 0 до 1
        //   let progress = (Date.now() - this.prevTime) / (this.newTime - this.prevTime);
          
        //   // Интерполируем позиции
        //   // this.pos.x = this.prevPos.x + (this.newPos.x - this.prevPos.x) * progress;
        //   // this.pos.y = this.prevPos.y + (this.newPos.y - this.prevPos.y) * progress;
        //   this.pos.x = this.prevPos.x + (this.newPos.x - this.prevPos.x) * progress * (this.velocity.x / 10);
        //   this.pos.y = this.prevPos.y + (this.newPos.y - this.prevPos.y) * progress * (this.velocity.y / 10);
        // }
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