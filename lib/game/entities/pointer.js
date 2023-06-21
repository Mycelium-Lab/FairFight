ig.module(
    'game.entities.pointer'
  )
.requires(
'impact.entity'
)
.defines(function() {

EntityPointer = ig.Entity.extend({
    size: { x: 15, y: 28 },
    offset: { x: 0, y: 0 },
    animSheet: new ig.AnimationSheet('../media/sprites/pointer3.png', 15, 28),

    init: function(x, y, settings) {
        this.parent(x, y, settings)
        this.addAnim('idle', 1, [0])
        this.currentAnim = this.anims.idle
        this.zIndex = 999
    },

    update: function() {
        let nearestRemotePlayer = null
        let nearestDistance = Infinity
        for (let userId in ig.game.remotePlayers) {
          let remotePlayer = ig.game.remotePlayers[userId]
          let distance = ig.game.player.distanceTo(remotePlayer)
          if (distance < nearestDistance) {
            nearestRemotePlayer = remotePlayer
            nearestDistance = distance
          }
        }
        
        let cameraX = ig.game.camera.pos.x
        let cameraY = ig.game.camera.pos.y
        let cameraMaxX = ig.game.camera.max.x
        let cameraMaxY = ig.game.camera.max.y

        let targetX = cameraX + cameraMaxX / 2
        let targetY = cameraY + 20
      
        // this.pos.x = targetX 
        // this.pos.y = targetY
      
        if (nearestRemotePlayer) {
            let angle = Math.atan2(nearestRemotePlayer.pos.y - ig.game.player.pos.y, nearestRemotePlayer.pos.x - ig.game.player.pos.x)
            this.currentAnim.angle = angle
            let circleRadius = cameraMaxX // Радиус окружности, по которой будет двигаться стрелка
            let centerY = cameraY + cameraMaxY / 2
            targetY = centerY + circleRadius * Math.sin(angle) // Координата Y с учетом угла поворота
            // Определение координаты X в зависимости от угла поворота
            let centerX = cameraX + cameraMaxX / 2 // Центр по оси X для стрелки
            targetX = centerX + circleRadius * Math.cos(angle) // Координата X с учетом угла поворота

            // Проверка и коррекция координат, чтобы стрелка оставалась видимой в пределах карты
            let arrowWidth = this.size.x /* ширина стрелки */
            let arrowHeight = this.size.y/* высота стрелки */

            if (targetX < cameraX) {
                targetX = cameraX
            } else if (targetX > cameraX + cameraMaxX - arrowWidth) {
                targetX = cameraX + cameraMaxX - arrowWidth
            }

            if (targetY < cameraY) {
                targetY = cameraY + arrowHeight / 2
            } else if (targetY > cameraY + cameraMaxY) {
                targetY = cameraY + cameraMaxY - arrowHeight
            }

            this.pos.x = targetX
            this.pos.y = targetY
            //if rival in camera view
            if (
                nearestRemotePlayer.pos.x >= cameraX && nearestRemotePlayer.pos.x <= cameraX + cameraMaxX &&
                nearestRemotePlayer.pos.y >= cameraY && nearestRemotePlayer.pos.y <= cameraY + cameraMaxY
            ) this.pos.x = -100
        }
      
        this.parent()
      },
      
    
    draw: function() {
        this.parent()
      }
      
})

})

function lerp(a, b, t) {
    return (1 - t) * a + t * b
}  