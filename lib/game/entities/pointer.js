ig.module(
    'game.entities.pointer'
  )
.requires(
'impact.entity'
)
.defines(function() {

EntityPointer = ig.Entity.extend({
    size: { x: 32, y: 32 },
    offset: { x: 0, y: 0 },
    animSheet: new ig.AnimationSheet('../media/sprites/pointer.png', 32, 32),

    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 1, [0]);
        this.currentAnim = this.anims.idle;
        this.zIndex = 999
    },

    update: function() {
        let nearestRemotePlayer = null;
        let nearestDistance = Infinity;
        for (let userId in ig.game.remotePlayers) {
          let remotePlayer = ig.game.remotePlayers[userId];
          let distance = ig.game.player.distanceTo(remotePlayer);
          if (distance < nearestDistance) {
            nearestRemotePlayer = remotePlayer;
            nearestDistance = distance;
          }
        }
      
        let targetX = ig.game.camera.pos.x + ig.game.camera.max.x / 2;
        let targetY = ig.game.camera.pos.y + 20;
      
        this.pos.x = targetX
        this.pos.y = targetY
      
        if (nearestRemotePlayer) {
          let angle = Math.atan2(nearestRemotePlayer.pos.y - ig.game.player.pos.y, nearestRemotePlayer.pos.x - ig.game.player.pos.x);
          this.currentAnim.angle = angle;
        }
      
        this.parent();
      },
      
    
    draw: function() {
        this.parent();
      }
      
});

});

function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}  