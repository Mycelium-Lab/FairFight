ig.module(
    'game.entities.bursting'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityBurstingBulletStatic = ig.Entity.extend({
        size:{ x: 32, y: 44},
        checkAgainst: ig.Entity.TYPE.A,
        animSheet: new ig.AnimationSheet('../media/sprites/bulletTriple.png',32,44),
        init: function(x,y,settings){
            this.parent(x,y,settings);
            this.addAnim('idle', 0.2, [0,1,2,3]);
        },
        check: function(other){
            ig.game.onPlayerCollectedBurstingBulletStatic(this);
        },
        update: function(){
            this.currentAnim.update();
        }
    })
})