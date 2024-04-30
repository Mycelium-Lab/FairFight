// jscs:disable validateIndentation
ig.baked=true
ig.module('game.entities.mole')
.requires('impact.entity')
.defines(function(){
    EntityMole = ig.Entity.extend({
        size:{ x: 16, y: 20},
        checkAgainst: ig.Entity.TYPE.A,
        animSheet: new ig.AnimationSheet('../media/sprites/M_Spawn.png',64,64),
        init: function(x,y,settings){
            this.parent(x,y,settings);
            this.addAnim('idle', 0.2, [0,1,2,3,4,5,6]);
        },
        check: function(other){
            ig.game.onPlayerCollectedMole(this);
        },
        update: function(){
            this.currentAnim.update();
        }
    });
});
