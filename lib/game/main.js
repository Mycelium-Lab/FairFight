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


const provider = new ethers.providers.Web3Provider(window.ethereum)
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

let imageCharacterUrl = URL.createObjectURL(player1Image);
let imageCharacter = new Image();
imageCharacter.src = imageCharacterUrl;

let imageRivalCharacterUrl = URL.createObjectURL(player2Image);
let imageRivalCharacter = new Image();
imageRivalCharacter.src = imageRivalCharacterUrl;
const Maps = [
  {
    level: LevelMain,
    background: new ig.Image('../media/tiles/15.png'),
    x: 1025,
    y: 770,
    minimap: {x: 210, y: 200}
  },
  {
    level: LevelMoon,
    background: new ig.Image('../media/tiles/moon4444.png'),
    x: 2046,
    y: 770,
    minimap: {x: 400, y: 200}
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
MyGame = ig.Game.extend({


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
    this.camera = new Camera(ig.system.width / 4,ig.system.height / 3,5);
    this.camera.trap.size.x = ig.system.width / 20;
    this.camera.trap.size.y = ig.system.height / 6;
    this.camera.lookAhead.x = ig.ua.mobile ? ig.system.width / 6 : 0;
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

GameRoom = ig.Class.extend({
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
    ig.main('#canvas', MyGame, 60, chosenMap.x, chosenMap.y, 3);
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

});
