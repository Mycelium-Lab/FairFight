ig.module(
    'game.entities.trampoline'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityTrampoline = ig.Entity.extend({
        size: {x: 64, y: 32}, 
        gravityFactor: 0, 
        collides: ig.Entity.COLLIDES.FIXED, 

        animSheet: new ig.AnimationSheet('../media/sprites/trampolineAnim.png', 64, 32),

        init: function(x, y, settings) {
            this.parent(x, y, settings);

            this.addAnim('idle', 1, [0]);
            this.addAnim('jump', 0.05, [0, 1, 2, 3, 4]);
        },
        collideWith: function( other, axis ){
            if (axis == 'y') {
                other.vel.y = -500
                this.currentAnim = this.anims.jump
                setTimeout(() => {
                    this.currentAnim = this.anims.idle
                }, 250)
            }
        }
    })
})
