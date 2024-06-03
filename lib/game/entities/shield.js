// jscs:disable validateIndentation
ig.baked=true
ig.module('game.entities.shield')
.requires('impact.entity')
.defines(function(){
    EntityShield = ig.Entity.extend({
        size:{ x: 32, y: 32},
        checkAgainst: ig.Entity.TYPE.A,
        animSheet: new ig.AnimationSheet('../media/sprites/shield.png',32,32),
        init: function(x,y,settings){
            this.parent(x,y,settings);
            this.addAnim('idle', 0.2, [0,1,2,3,4,5,6,7,8]);
        },
        check: function(other){
            ig.game.onPlayerCollectedShield(this);
        },
        update: function(){
            this.currentAnim.update();
        }
    });
});
