ig.module(
    'game.entities.igniting'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityIgnitingBulletStatic = ig.Entity.extend({
        size:{ x: 32, y: 32},
        checkAgainst: ig.Entity.TYPE.A,
        animSheet: new ig.AnimationSheet('../media/sprites/bulletIgniting.png',32,32),
        init: function(x,y,settings){
            this.parent(x,y,settings);
            this.addAnim('idle', 0.1, [0,1,2,3]);
        },
        check: function(other){
            ig.game.onPlayerCollectedIgnitingBulletStatic(this);
        },
        update: function(){
            this.currentAnim.update();
        }
    })
})