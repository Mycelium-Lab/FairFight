// jscs:disable validateIndentation
ig.baked=true
ig.module('game.entities.teleport')
.requires('impact.entity')
.defines(function(){
    EntityTeleport = ig.Entity.extend({
        size:{ x: 20, y: 32},
        checkAgainst: ig.Entity.TYPE.A,
        animSheet: new ig.AnimationSheet('../media/sprites/teleport.png',64,64),
        init: function(x,y,settings){
            this.parent(x,y,settings);
            this.addAnim('idle', 0.2, [0,1,2,3,4,5,6,7]);
        },
        check: function(other){
            ig.game.onPlayerCollectedTeleport(this);
        },
        update: function(){
            this.currentAnim.update();
        }
    });
});
