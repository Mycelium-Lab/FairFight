ig.module(
    'game.entities.moving-platform'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityMovingPlatform = ig.Entity.extend({
        size: { x: 96, y: 32 },
        offset: { x: 0, y: 0 },
        checkAgainst: ig.Entity.TYPE.A,
        collides: ig.Entity.COLLIDES.FIXED, 
        animSheet: new ig.AnimationSheet('../media/sprites/moving_platform.png', 96, 32),
        moving: 0, // 0 - x, 1 - y, 2 - circle
        maximumX: 0,
        minimumX: 0,
        maximumY: 0,
        minimumY: 0,
        speed: 0, 
        basicSpeed: 0,
        addingToSpeed: 10,
        centerX: 0, 
        centerY: 0, 
        radius: 0,
        angle: 0,
        angularSpeed: 0, 
    
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
            this.currentAnim = this.anims.idle;
            this.maximumX = settings.maximumX;
            this.minimumX = settings.minimumX;
            this.maximumY = settings.maximumY;
            this.minimumY = settings.minimumY;
            this.speed = settings.speed
            this.basicSpeed = settings.speed
            this.xMoving = settings.xMoving
            this.centerX = settings.centerX
            this.centerY = settings.centerY
            this.radius = settings.radius
            this.angle = settings.angle
            this.angularSpeed = settings.angularSpeed
            this.gravityFactor = 0
            // setInterval(this.changeSpeed.bind(this), 10000);
        },
    
        update: function() {
            if (this.moving == 0) {
                if (this.pos.x >= this.maximumX || this.pos.x <= this.minimumX) {
                    this.speed = -this.speed;
                }
                this.vel.x = this.speed;
            }
            if (this.moving == 1) {
                if (this.pos.y >= this.maximumY || this.pos.y <= this.minimumY) {
                    this.speed = -this.speed;
                }
                this.vel.y = this.speed;
            }
            if (this.moving == 2) {
                this.angle += this.angularSpeed;

                this.pos.x = this.centerX + Math.cos(this.angle) * this.radius;
                this.pos.y = this.centerY + Math.sin(this.angle) * this.radius;
            }
            this.parent();
        },

        changeSpeed: function() {
            if (this.vel.x === this.speed) {
                this.speed += this.addingToSpeed;
            } else {
                this.speed = this.basicSpeed;
            }
            console.log(this.speed)
        },
    })
})