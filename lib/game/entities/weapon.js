// jscs:disable validateIndentation
ig.module(
    'game.entities.weapon'
).requires(
    'impact.entity',
    'game.entities.particle'
).defines(async function() {
    EntityWeapon = ig.Entity.extend({
        size: {
          x: 10,
          y: 10
        },
        offset: {
          x: 10,
          y: 8
        },
        animSheet: new ig.AnimationSheet('../../media/sprites/weapon.png', 10, 10),
        init: function(x, y, settings) {
          this.parent(x, y, settings);
          this.addAnim('idle', 1, [0])
          this.currentAnim = this.anims.idle
        },
        update: function() {
          // Позиционирование оружия относительно персонажа
          var player = ig.game.player;
          if (player) {
            this.pos.x = player.pos.x + (player.flip ? -this.offset.x : player.size.x - this.offset.x);
            this.pos.y = player.pos.y + this.offset.y + 10;
          }
          this.parent();
        }
      });
      
})
