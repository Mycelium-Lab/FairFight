// jscs:disable validateIndentation
ig.baked=true
ig.module('game.entities.mole')
.requires('impact.entity')
.defines(function(){
    EntityMole = ig.Entity.extend({
        size:{ x: 32, y: 20},
        checkAgainst: ig.Entity.TYPE.A,
        animSheet: new ig.AnimationSheet('../media/sprites/teleportVert.png',64,64),
        init: function(x,y,settings){
            this.parent(x,y,settings);
            this.addAnim('idle', 0.2, [0,3,6,9,12,15,18,21]);
        },
        check: function(other){
            ig.game.onPlayerCollectedMole(this);
        },
        update: function(){
            this.currentAnim.update();
        }
    });
});
