// jscs:disable validateIndentation
ig.baked=true
ig.module('game.entities.invisible')
.requires('impact.entity')
.defines(function(){
    EntityInvisible = ig.Entity.extend({
        size:{ x: 16, y: 20},
        checkAgainst: ig.Entity.TYPE.A,
        animSheet: new ig.AnimationSheet('../media/sprites/invisible.png',64,64),
        init: function(x,y,settings){
            this.parent(x,y,settings);
            this.addAnim('idle', 0.2, [0,1,2,3,4,5]);
        },
        check: function(other){
            ig.game.onPlayerCollectedInvisible(this);
        },
        update: function(){
            this.currentAnim.update();
        }
    });
});
