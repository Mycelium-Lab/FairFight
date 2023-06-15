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
        
        let cameraX = ig.game.camera.pos.x
        let cameraY = ig.game.camera.pos.y
        let cameraMaxX = ig.game.camera.max.x
        let cameraMaxY = ig.game.camera.max.y

        let targetX = cameraX + cameraMaxX / 2;
        let targetY = cameraY + 20;
      
        this.pos.x = targetX
        this.pos.y = targetY
      
        if (nearestRemotePlayer) {
            let angle = Math.atan2(nearestRemotePlayer.pos.y - ig.game.player.pos.y, nearestRemotePlayer.pos.x - ig.game.player.pos.x);
            this.currentAnim.angle = angle;
            if (
                nearestRemotePlayer.pos.x >= cameraX && nearestRemotePlayer.pos.x <= cameraX + cameraMaxX &&
                nearestRemotePlayer.pos.y >= cameraY && nearestRemotePlayer.pos.y <= cameraY + cameraMaxY
            ) this.pos.x = -100
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