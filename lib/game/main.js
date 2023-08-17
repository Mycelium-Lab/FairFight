// jscs:disable validateIndentation
ig.module(
  'game.main'
)
.requires(
  'impact.game',
  'impact.font',

  'game.camera',
  'game.entities.player',
  'game.entities.remote-player',
  'game.entities.pointer',
  'game.entities.weapon',
  'game.levels.main',
  'game.levels.moon',
  'game.events',
  'plugins.minimap',
  // 'plugins.touch-button',

  'net.room-connection'
)
.defines(async function() {

var log = console.log.bind(console);

// Messages
var MESSAGE_STATE = 0;
var MESSAGE_DIED = 2;
var MESSAGE_SHOOT = 3;
var MESSAGE_COLLECT_WEAPON = 4;
var MESSAGE_FRAG_COUNT = 5;

// Fields
var FIELD_TYPE = 'type';
var FIELD_X = 'x';
var FIELD_Y = 'y';
var FIELD_VEL_X = 'vel_x';
var FIELD_VEL_Y = 'vel_y';
var FIELD_ANIM = 'anim';
var FIELD_FRAME = 'frame';
var FIELD_FLIP = 'flip';
var FIELD_WEAPON_ID = 'weapon_id';
var FIELD_KILLER_ID = 'killer_id';
var FIELD_FRAG_COUNT = 'frag_count';

const mobileAndTabletCheck = () => {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
if (mobileAndTabletCheck()) {
  while (typeof window._provider === 'undefined') {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
const provider = new ethers.providers.Web3Provider(window._provider ? window._provider : window.ethereum)
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner()
const address = await signer.getAddress()
const rawResponse = await fetch('/getinventory', {
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
  },
  body: JSON.stringify({address, chainid: Network.chainid})
}).catch(err => {
    console.log(err)
    return {}
});
const inventory = await rawResponse.json();
let query = new URLSearchParams();
query.append("gameid", GameID)
query.append("chainid", Network.chainid)
const MapID = await fetch('/getgamesprops?' + query).then(async (res) => (await res.json()).map).catch(err => {
  console.log(err)
  return 0
})
//PLAYERS
const players = await Contract.getFightPlayers(GameID)
const player1 = players[0]
const player2 = players[1]
//GET IMAGES
let character = new URLSearchParams();
character.append("address", address)
character.append("chainid", Network.chainid)
character.append("isrival", false)
const rawResponse3 = await fetch('/getcharacterimage?' + character)
let player1Image = await rawResponse3.blob().catch(err => console.log(err))
let rivalCharacter = new URLSearchParams();
rivalCharacter.append("address", address == player2 ? player1 : player2)
rivalCharacter.append("chainid", Network.chainid)
rivalCharacter.append("isrival", true)
const rawResponse4 = await fetch('/getcharacterimage?' + rivalCharacter)
let player2Image = await rawResponse4.blob().catch(err => console.log(err))

let imageCharacter = new Image()

let imageRivalCharacter = new Image()

let isImageCharacterLoaded = false;
let isImageRivalCharacterLoaded = false;

const reader = new FileReader();

reader.onload = function(event) {
    try {
        imageCharacter.onload = function() {
            isImageCharacterLoaded = true;
            checkBothImagesLoaded();
        };
        imageCharacter.src = event.target.result;
    } catch (error) {
        console.log("Error loading imageCharacter:", error);
    }
};

reader.onerror = function(error) {
    console.log("Error reading player1Image:", error);
};

reader.readAsDataURL(player1Image);

const secondReader = new FileReader();

secondReader.onload = function(event) {
    try {
        imageRivalCharacter.onload = function() {
            isImageRivalCharacterLoaded = true;
            checkBothImagesLoaded();
        };
        imageRivalCharacter.src = event.target.result;
    } catch (error) {
        console.log("Error loading imageRivalCharacter:", error);
    }
};

secondReader.onerror = function(error) {
    console.log("Error reading player2Image:", error);
};

secondReader.readAsDataURL(player2Image);

const Maps = [
  {
    level: LevelMain,
    background: new ig.Image('../media/tiles/15.png'),
    x: 1025,
    y: 770,
    reduceSizeX: 1,
    reduceSizeY: 1,
    minimap: {x: 200, y: 200}
  },
  {
    level: LevelMoon,
    background: new ig.Image('../media/tiles/moon4444.png'),
    x: 2046,
    y: 770,
    reduceSizeX: 1.3,
    reduceSizeY: 1.3,
    minimap: {x: 260, y: 150}
  }
]
const chosenMap = Maps[parseInt(MapID)]
let showMinimap = true
document.onkeydown = function(event) {
  if (event.keyCode == 'M'.charCodeAt(0)) {
    // Show/Hide minimap
    showMinimap = !showMinimap
  }
}

function checkBothImagesLoaded() {
  if (isImageCharacterLoaded && isImageRivalCharacterLoaded) {
    let MyGame = ig.Game.extend({
    
    
      WEAPON_RESPAWN_TIME: 10, //sec
      WEAPON_PER_TUBE: 2,
    
      SHOW_MESSAGE_PERIOD: 1.3,
    
      // Load a font
      font: new ig.Font('../media/04b03.font.png'),
      background: chosenMap.background, 
      
      gravity: 240,
    
      roomName: window.location.search.slice(4),
      clearColor: null, // set clearColor to null to allow correct layer ordering
      hackyClearColor: '#000000',
      fragCount: 0,
    
      connection: null,
    
      player: null,
      pointer: null,
      remotePlayers: {},
    
      spawnWeaponQueue: [],
    
      textMessage: 'FIGHT!!!',
      textMessageTimer: 0,
      // buttons: null,
      // buttonImageLeft: new ig.Image( '../media/buttonleft.png' ),
      // buttonImageRight: new ig.Image( '../media/buttonright.png' ),
      // buttonImageJump: new ig.Image( '../media/buttonup.png' ),
      // buttonImageShoot: new ig.Image( '../media/bullet.png' ),
    
      init: function() {
        this.connection = window.gameRoom.roomConnection;
        this.connectionHandlers = {
          'peer_message': this.onPeerMessage,
          'user_leave': this.onUserLeave
        };
        Events.on(this.connection, this.connectionHandlers, this);
    
        // input
        ig.input.bind(ig.KEY.A, 'left');
        ig.input.bind(ig.KEY.D, 'right');
        ig.input.bind(ig.KEY.W, 'jump');
        ig.input.bind(ig.KEY.SPACE, 'shoot');
        if( ig.ua.mobile ) {
          ig.input.bindTouch( '#left-btn', 'left' );
          ig.input.bindTouch( '#right-btn', 'right' );
          ig.input.bindTouch( '#jump-btn', 'jump' );
          ig.input.bindTouch( '#shoot-btn', 'shoot' );
        } 
    
        this.loadLevel(chosenMap.level)
    
        // player
        this.spawnPlayer();
        this.pointer = ig.game.spawnEntity(EntityPointer, 1400, 1400)
        // ig.game.spawnEntity(EntityWeapon, 0, 0);
        this.generateMiniMap("minimap", chosenMap.minimap.x, chosenMap.minimap.y, [0]);
        // camera
        this.camera = new Camera(ig.system.width/4,ig.system.height/3,5);
        this.camera.trap.size.x = ig.system.width / 20;
        this.camera.trap.size.y = ig.system.height / 6;
        this.camera.lookAhead.x = 0;
        this.camera.lookAhead.y = 0;
        this.camera.max.x = this.collisionMap.width * this.collisionMap.tilesize - ig.system.width;
        this.camera.max.y = this.collisionMap.height * this.collisionMap.tilesize - ig.system.height;
        this.camera.set(this.player);
      },
    
      playerShoot: function() {
        var isFlip = this.player.flip;
        var x = this.player.pos.x + (isFlip ? -40 : 60);
        var y = this.player.pos.y + 20;
    
        // Spawn an entity, and broadcast about it
        ig.game.spawnEntity(EntityProjectile, x, y, {
          flip: isFlip
        });
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_SHOOT)
          .setX(x)
          .setY(y)
          .setFlip(isFlip)
        );
      },
    
      playerDied: function(killerId) {
        var msg = MessageBuilder.createMessage(MESSAGE_DIED);
        if (killerId) {
          msg.setKillerId(killerId);
        }
        this.connection.broadcastMessage(msg);
        this.spawnPlayer();
      },
    
      spawnPlayer: function() {
        var spawnPos = this.getRandomSpawnPos();
        this.player = this.spawnEntity(EntityPlayer, spawnPos.x, spawnPos.y, {mapID: MapID, image: imageCharacter.src});
        this.player.health += inventory.health_bonus == null ? 0 : inventory.health_bonus * 10
        this.player.setHealth(this.player.health)
        this.player.weaponsLeft += inventory.bullets_bonus == null ? 0 : inventory.bullets_bonus
        this.player.setAmmunition(this.player.weaponsLeft)
        this.player.MAX_WEAPONS += inventory.bullets_bonus == null ? 0 : inventory.bullets_bonus
        this.player.jump += inventory.jump_bonus == null ? 0 : inventory.jump_bonus
        this.player.maxVel.x += inventory.speed_bonus == null ? 0 : inventory.speed_bonus
      },
    
      getRandomSpawnPos: function() {
        var pods = ig.game.getEntitiesByType(EntityRespawnPod);
        var pod = pods[Number.random(0, pods.length - 1)];
        return pod.getSpawnPos();
      },
    
      onUserLeave: function(user) {
        var remotePlayer = this.remotePlayers[user.userId];
        if (remotePlayer) {
          remotePlayer.kill();
          delete this.remotePlayers[user.userId];
        }
      },
    
      onPeerMessage: function(message, user, peer) {
        var remotePlayer = this.remotePlayers[user.userId];
        // console.log(this.remotePlayers)
        if (!remotePlayer && message.getType() === MESSAGE_STATE) {
          log('%cCreated remote player for %d', 'color: blue;', user.userId);
          remotePlayer = this.spawnRemotePlayer(user, message.getX(), message.getY());
          document.getElementById("canvas").style.display = ''
          document.getElementById("noCanvas").style.display = 'none'
          document.getElementById("wainting_modal").style.display = 'none'
        }
        switch (message.getType()) {
          case MESSAGE_STATE:
            this.onPlayerState(remotePlayer, message);
            break;
    
          case MESSAGE_DIED:
            this.onPlayerDied(remotePlayer, message, user);
            break;
    
          case MESSAGE_SHOOT:
            this.onPlayerShoot(remotePlayer, message, user);
            break;
    
          case MESSAGE_COLLECT_WEAPON:
            this.onRemotePlayerCollectedWeapon(remotePlayer, message);
            break;
    
          case MESSAGE_FRAG_COUNT:
            this.onRemotePlayerFragCount(remotePlayer, message, user);
            break;
        }
      },
    
      spawnRemotePlayer: function(user, x, y) {
        this.remotePlayers[user.userId] =
          this.spawnEntity(EntityRemotePlayer, x, y, {image: imageRivalCharacter.src});
        return this.remotePlayers[user.userId];
      },
    
      onPlayerState: function(remotePlayer, message) {
        remotePlayer.setState(message);
      },
    
      onPlayerDied: function(remotePlayer, message, user) {
        if (user !== undefined) {
          if (user.walletAddress !== undefined) {
            this.connection.playerDied(user.walletAddress);
          } else {
            this.connection.playerDied(user.user.walletAddress);
          }
        }
        if (remotePlayer) {
          remotePlayer.kill();
        }
        delete this.remotePlayers[user.userId];
      },
    
      onPlayerShoot: function(remotePlayer, message, user) {
        console.log('here')
        ig.game.spawnEntity(EntityProjectileRemote, message.getX(), message.getY(), {
          flip: message.getFlip(),
          userId: user.userId
        });
      },
    
      onRemotePlayerCollectedWeapon: function(remotePlayer, message) {
        this.onWeaponCollected(message.getWeaponId());
      },
    
      onRemotePlayerFragCount: function(remotePlayer, message, user) {
        this.setTextMessage('Player ' + user.userId + ' has ' + message.getFragCount() + ' frags!!');
      },
    
      onPlayerCollectedWeapon: function(weapon) {
        this.player.addWeapons(this.WEAPON_PER_TUBE);
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_WEAPON)
          .setWeaponId(weapon.weaponId)
        );
        this.onWeaponCollected(weapon.weaponId);
      },
    
      onWeaponCollected: function(weaponId) {
        var weapon = ig.game.getEntitiesByType(EntityTestTube).find(function(weapon) {
          return weapon.weaponId === weaponId;
        });
        if (weapon) {
          weapon.kill();
          this.spawnWeaponQueue.push([weapon, ig.Timer.time]);
        }
      },
    
      spawnWeapons: function() {
        while (this.spawnWeaponQueue.length) {
          var delta = ig.Timer.time - this.spawnWeaponQueue[0][1];
          if (delta < this.WEAPON_RESPAWN_TIME) {
            break;
          }
          var weapon = this.spawnWeaponQueue.pop()[0];
          ig.game.spawnEntity(EntityTestTube, weapon.pos.x, weapon.pos.y, {
            weaponId: weapon.weaponId
          });
        }
      },
    
      update: function() {
        this.camera.follow(this.player);
        this.pointer.pos.x = ig.system.width / 2;
        this.pointer.pos.y = ig.system.height / 2;
        // Update all entities and backgroundMaps
        this.parent();
    
        // Broadcast state
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_STATE)
          .setX(this.player.pos.x * 10)
          .setY(this.player.pos.y * 10)
          .setVelX((this.player.pos.x - this.player.last.x) * 10)
          .setVelY((this.player.pos.y - this.player.last.y) * 10)
          .setFrame(this.player.getAnimFrame())
          .setAnim(this.player.getAnimId())
          .setFlip(this.player.currentAnim.flip.x ? 1 : 0));
    
        this.updateText();
        this.spawnWeapons();
      },
    
      draw: function() {// Clear before everything!
        ig.system.clear( this.hackyClearColor );
    
        // Background            
        this.background.draw(0,0);
        // Draw all entities and backgroundMaps
        this.parent();
        if (showMinimap) {
          this.drawMiniMap("minimap", 0, 0, ["EntityPlayer", "EntityRemotePlayer"]);
        }
        // if( this.buttons ) {
        //   this.buttons.draw(); 
        // }
    
        this.camera.draw();
        this.drawText();
      },
    
      setTextMessage: function(message) {
        this.textMessage = message;
        this.textMessageTimer = ig.Timer.time;
      },
    
      drawText: function() {
        if (this.textMessage) {
          this.font.draw(this.textMessage, ig.system.width / 2, 8, ig.Font.ALIGN.CENTER);
        }
      },
    
      updateText: function() {
        if (!this.textMessage) {
          return;
        }
        if (ig.Timer.time - this.textMessageTimer >= this.SHOW_MESSAGE_PERIOD) {
          this.textMessage = '';
        }
      }
    });
    
    let GameRoom = ig.Class.extend({
      roomId: null,
      roomConnection: null,
      socket: null,
    
      init: function(socketUrl, walletAddress, publicKey) {
        this.roomId = window.location.search.slice(4);
        this.registerMessages();
        this.socket = io(socketUrl);
        this.roomConnection = new RoomConnection(this.roomId, this.socket);
        this.roomConnection.on('joined', this.onJoinedRoom, this);
        this.roomConnection.on('channel_closed', this.onChannelClosed, this);
        this.connect();
      },
    
      registerMessages: function() {
        MessageBuilder.registerMessageType(MESSAGE_STATE, [
          FIELD_TYPE,
          FIELD_X,
          FIELD_Y,
          FIELD_VEL_X,
          FIELD_VEL_Y,
          FIELD_FRAME,
          FIELD_ANIM,
          FIELD_FLIP
        ]);
        MessageBuilder.registerMessageType(MESSAGE_DIED, [
          FIELD_TYPE,
          FIELD_KILLER_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_SHOOT, [
          FIELD_TYPE,
          FIELD_X,
          FIELD_Y,
          FIELD_FLIP
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_WEAPON, [
          FIELD_TYPE,
          FIELD_WEAPON_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_FRAG_COUNT, [
          FIELD_TYPE,
          FIELD_FRAG_COUNT
        ]);
      },
    
      onJoinedRoom: function(roomInfo) {
        console.log('%cJoined room', 'color: green', roomInfo);
        ig.main('#canvas', MyGame, 60, chosenMap.x / chosenMap.reduceSizeX, chosenMap.y / chosenMap.reduceSizeY, ig.ua.mobile ? 0.5 : 3);
      },
    
      connect: async function() {
        // var address = localStorage.getItem("walletAddress")
        var pubkey = localStorage.getItem("publicKey")
        this.roomConnection.connect(address, pubkey);
      },
    
      finishGame: async function() {
        if (this.roomConnection.paymentChannel) {
          return new Promise(resolve => {
            this.roomConnection.on('user_closed_channel', () => resolve(), this);
            this.roomConnection.signClosePaymentChannel();
          });
        } else return;
      },
    
      onChannelClosed: function() {
        window.location.search = "";
      }
    
    });
    
    window.gameRoom = new GameRoom(
      `${window.location.protocol}//` + window.location.hostname + (window.location.hostname.includes('localhost') ? ':8033' : ''),
      address,
      localStorage.getItem('publicKey')
    );
  }
}

checkBothImagesLoaded();
});
