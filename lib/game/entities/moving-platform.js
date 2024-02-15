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
        xMoving: true,
        maximumX: 0,
        minimumX: 0,
        maximumY: 0,
        minimumY: 0,
        speed: 50, // Скорость движения платформы
    
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
            this.currentAnim = this.anims.idle;
            this.maximumX = settings.maximumX;
            this.minimumX = settings.minimumX;
            this.maximumY = settings.maximumY;
            this.minimumY = settings.minimumY;
            this.speed = settings.speed
            this.xMoving = settings.xMoving
            this.gravityFactor = 0
        },
    
        update: function() {
            if (this.xMoving) {
                if (this.pos.x >= this.maximumX || this.pos.x <= this.minimumX) {
                    this.speed = -this.speed;
                }
                this.vel.x = this.speed;
            }
            if (!this.xMoving) {
                if (this.pos.y >= this.maximumY || this.pos.y <= this.minimumY) {
                    this.speed = -this.speed;
                }
                this.vel.y = this.speed;
            }
            this.parent();
        },
    })
})