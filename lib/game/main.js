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
  'game.entities.trampoline',
  'game.entities.teleport',
  'game.entities.dynamite',
  'game.entities.invisible',
  'game.entities.bursting',
  'game.entities.igniting',
  'game.entities.shield',
  'game.entities.mole',
  'game.entities.moving-platform',
  'game.levels.main',
  'game.levels.moon',
  'game.levels.dungeon',
  'game.levels.farm',
  'game.levels.city',
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
var MESSAGE_COLLECT_TELEPORT = 6;
var MESSAGE_COLLECT_MOLE = 7;
var MESSAGE_COLLECT_INVISIBLE = 8;
var MESSAGE_COLLECT_DYNAMITE = 9;
var MESSAGE_COLLECT_STUN = 10;
var MESSAGE_COLLECT_BURSTING = 11;
var MESSAGE_COLLECT_IGNITING = 12;
var MESSAGE_COLLECT_SHIELD = 13;

// Fields
var FIELD_TYPE = 'type';
var FIELD_X = 'x';
var FIELD_Y = 'y';
var FIELD_VEL_X = 'vel_x';
var FIELD_VEL_Y = 'vel_y';
var FIELD_ANIM = 'anim';
var FIELD_FRAME = 'frame';
var FIELD_FLIP = 'flip';
var FIELD_TYPE_OF_BULLET = 'type_of_bullet';
var FIELD_WEAPON_ID = 'weapon_id';
var FIELD_TELEPORT_ID = 'teleport_id';
var FIELD_MOLE_ID = 'mole_id';
var FIELD_INVISIBLE_ID = 'invisible_id';
var FIELD_DYNAMITE_ID = 'dynamite_id';
var FIELD_BURSTING_ID = 'bursting_id';
var FIELD_IGNITING_ID = 'igniting_id';
var FIELD_STUN_ID = 'stun_id'
var FIELD_SHIELD_ID = 'shield_id'
var FIELD_KILLER_ID = 'killer_id';
var FIELD_FRAG_COUNT = 'frag_count';

const mobileAndTabletCheck = () => {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
let gameID;
let token;
let decimals;
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
network = networks.find(n => n.chainid == params.network)
gameID = params.ID
token = params.token
decimals = params.decimals
if (mobileAndTabletCheck()) {
  if ((network.chainid != 0) && (network.chainid != 999999)) {
    while (typeof window._provider === 'undefined') {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
let address = ''
let player1 = ''
let player2 = ''
if ((network.chainid != 0) && (network.chainid != 999999)) {
  const provider = new ethers.providers.Web3Provider(window._provider ? window._provider : window.ethereum)
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner()
  address = await signer.getAddress()
  const players = await Contract.getFightPlayers(GameID)
  player1 = players[0]
  player2 = players[1]
} else {
  address = localStorage.getItem('tonwallet')
  let enemies = localStorage.getItem('ton_enemies') 
  enemies = enemies ? enemies.split(',') : []
  player1 = address
  player2 = enemies[0] || address
}
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
//GET IMAGES
let character = new URLSearchParams();
character.append("address", address)
character.append("chainid", Network.chainid)
character.append("typeofimage", 'main')
const rawResponse3 = await fetch('/getcharacterimage?' + character)
let player1Image = await rawResponse3.blob().catch(err => console.log(err))
let rivalCharacter = new URLSearchParams();
rivalCharacter.append("address", address == player2 ? player1 : player2)
rivalCharacter.append("chainid", Network.chainid)
rivalCharacter.append("typeofimage", 'rival')
const rawResponse4 = await fetch('/getcharacterimage?' + rivalCharacter)
let player2Image = await rawResponse4.blob().catch(err => console.log(err))

let imageCharacter = new Image()

let imageRivalCharacter = new Image()

/*const p1 = document.querySelector('#you-stats-skin')
         
p1.style.backgroundImage = `url(${imageCharacter.src})`
const p2 = document.querySelector('#enemy-stats-skin')

p2.style.backgroundImage = `url(${imageRivalCharacter.src})`*/

let isImageCharacterLoaded = false;
let isImageRivalCharacterLoaded = false;

const reader = new FileReader();

reader.onload = function(event) {
    try {
        imageCharacter.onload = function() {
          const p1 = document.querySelector('#you-stats-skin')
          p1.style.backgroundImage = `url(${imageCharacter.src})`
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
            const p2 = document.querySelector('#enemy-stats-skin')
            p2.style.backgroundImage = `url(${imageRivalCharacter.src})`
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
    background: new ig.Image('../media/tiles/16.png'),
    x: 1536,
    y: window.innerWidth >= 1024 ? 770 : 1536,
    reduceSizeX: window.innerWidth >= 1024 ? 1 : 2.5,
    reduceSizeY: window.innerWidth >= 1024 ? 1 : 2,
    minimap: {x: 200, y: 200},
    minimapPlace: {x: 0, y: 450},
    minimapPlaceMobile: {x: 0, y: 80}
  },
  {
    level: LevelMoon,
    background: new ig.Image('../media/tiles/moon4444.png'),
    x: 2046,
    y: 770,
    reduceSizeX: 1.3,
    reduceSizeY: 1.3,
    minimap: {x: 260, y: 150},
    minimapPlace: {x: 0, y: 400},
    minimapPlaceMobile: {x: 0, y: 70}
  },
  {
    level: LevelFarm,
    background: new ig.Image('../media/tiles/sky.png'),
    x: 1536,
    y: 770,
    reduceSizeX: 1,
    reduceSizeY: 1,
    minimap: {x: 200, y: 200},
    minimapPlace: {x: 0, y: 450},
    minimapPlaceMobile: {x: 0, y: 80}
  },
  {
    level: LevelDangeon,
    background: new ig.Image('../media/tiles/jungle3-2.png'),
    x: 1536,
    y: 770,
    reduceSizeX: 1,
    reduceSizeY: 1,
    minimap: {x: 200, y: 200},
    minimapPlace: {x: 0, y: 450},
    minimapPlaceMobile: {x: 0, y: 80}
  },
  {
    level: LevelCity,
    background: new ig.Image('../media/tiles/city.png'),
    x: 1920,
    y: 1080,
    reduceSizeX: 1,
    reduceSizeY: 1,
    minimap: {x: 200, y: 200},
    minimapPlace: {x: 0, y: 450},
    minimapPlaceMobile: {x: 0, y: 80}
  },
]
const chosenMap = Maps[parseInt(MapID)]

window.onload = () => {
  console.log("hello?")
}

window.showMinimap = false
document.onkeydown = function(event) {
  if (event.keyCode == 'M'.charCodeAt(0)) {
    // Show/Hide minimap
    window.showMinimap = !window.showMinimap
  }
  if (event.keyCode == 'F'.charCodeAt(0)) {
    // Show/Hide minimap
    window.fullScreen()
  }
}

function checkBothImagesLoaded() {
  if (isImageCharacterLoaded && isImageRivalCharacterLoaded) {
    let MyGame = ig.Game.extend({
    
    
      WEAPON_RESPAWN_TIME: 10, //sec
      WEAPON_PER_TUBE: 2,
    
      TELEPORT_RESPAWN_TIME: 10, //sec
      MOLE_RESPAWN_TIME: 10,
      DYNAMITE_RESPAWN_TIME: 10,
      INVISIBLE_RESWAWN_TIME: 10,
      SHIELD_RESPAWN_TIME: 10,
      STUN_RESPAWN_TIME: 10,
      BURSTING_RESWAWN_TIME: 10,
      IGNITING_RESPAWN_TIME: 10,

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
      remotePlayersAddresses: {},
      remotePlayersImages: {},
      remoteKilledPlayers: {},
      remotePlayerLoading: {},
      remotePlayerDied: {},
      prevPod: null,
    
      spawnWeaponQueue: [],
      spawnTeleportQueue: [],
      spawnMoleQueue: [],
      spawnInvisibleQueue: [],
      spawnDynamiteQueue: [],
      spawnStunQueue: [],
      spawnBurstingQueue: [],
      spawnIgnitingQueue: [],
      spawnShieldQueue: [],
    
      textMessage: 'FIGHT!!!',
      textMessageTimer: 0,
      // buttons: null,
      // buttonImageLeft: new ig.Image( '../media/buttonleft.png' ),
      // buttonImageRight: new ig.Image( '../media/buttonright.png' ),
      // buttonImageJump: new ig.Image( '../media/buttonup.png' ),
      // buttonImageShoot: new ig.Image( '../media/bullet.png' ),
      // shootSound: new ig.Sound( '../media/audio/shoot.mp3' ),
      // takeSound: new ig.Sound( '../media/audio/take.ogg' ),
      // backgroundSound: new ig.Sound( '../media/audio/background.ogg' ),
    
      init: function() {
        this.connection = window.gameRoom.roomConnection;
        this.connectionHandlers = {
          'peer_message': this.onPeerMessage,
          'user_leave': this.onUserLeave
        };
        Events.on(this.connection, this.connectionHandlers, this);
        this.connection.on('user_joined', this.onUserJoined, this);
        this.connection.on('lose_all', this.onLostAll, this);
        this.connection.on('update_balance', this.onUpdateBalance, this);

        // input
        ig.input.bind(ig.KEY.A, 'left');
        ig.input.bind(ig.KEY.D, 'right');
        ig.input.bind(ig.KEY.W, 'jump');
        ig.input.bind(ig.KEY.SPACE, 'shoot');
        // if( ig.ua.mobile ) {
          ig.input.bindTouch( '#left-btn', 'left' );
          ig.input.bindTouch( '#right-btn', 'right' );
          ig.input.bindTouch( '#jump-btn', 'jump' );
          ig.input.bindTouch( '#attack-btn', 'shoot' );
    
        this.loadLevel(chosenMap.level)
    
        // this.backgroundSound.play()
        // this.backgroundSound.loop = true
        // player
        this.spawnPlayer();
        this.pointer = ig.game.spawnEntity(EntityPointer, 1400, 1400)
        if (MapID == 3) {
          ig.game.spawnEntity(EntityTrampoline, 1200, 1365, { velMinus: -500 })
          ig.game.spawnEntity(EntityTrampoline, 1506, 610, { velMinus: -350 })
          // ig.game.spawnEntity(EntityTrampoline, 1855, 900, { velMinus: -500 })
          ig.game.spawnEntity(EntityTrampoline, 160, 1152, { velMinus: -500 })
          ig.game.spawnEntity(EntityTrampoline, 256, 1152, { velMinus: -500 })

          ig.game.spawnEntity(EntityTrampoline, 1822, 1024, { velMinus: -500 })
          ig.game.spawnEntity(EntityTrampoline, 1924, 1024, { velMinus: -500 })
        }
        if (MapID == 4) {
          ig.game.spawnEntity(EntityTrampoline, 462, 1340, { velMinus: -500 })
          ig.game.spawnEntity(EntityTrampoline, 1025, 1470, { velMinus: -300 })
          ig.game.spawnEntity(EntityTrampoline, 1138, 1340, { velMinus: -500 })
          ig.game.spawnEntity(EntityTrampoline, 1567, 1470, { velMinus: -800 })
          ig.game.spawnEntity(EntityTrampoline, 1295, 1020, { velMinus: -500 })
          ig.game.spawnEntity(EntityTrampoline, 1950, 1116, { velMinus: -700 })
          ig.game.spawnEntity(EntityTrampoline, 1454, 668, { velMinus: -400 })
          ig.game.spawnEntity(EntityTrampoline, 1022, 668, { velMinus: -300 })
          ig.game.spawnEntity(EntityTrampoline, 736, 700, { velMinus: -500 })
          ig.game.spawnEntity(EntityTrampoline, 351, 602, { velMinus: -400 })
          ig.game.spawnEntity(EntityTrampoline, 159, 1118, { velMinus: -530 })
          ig.game.spawnEntity(EntityTrampoline, 896, 254, { velMinus: -300 })
          ig.game.spawnEntity(EntityTrampoline, 1152, 254, { velMinus: -300 })
          ig.game.spawnEntity(EntityTrampoline, 1408, 254, { velMinus: -300 })
          ig.game.spawnEntity(EntityTrampoline, 1856, 668, { velMinus: -500 })
        }
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
        if (ig.ua.iPhone) {
          document.querySelector('#open-fullscreen-btn').style.display = 'none'
          document.querySelector('#close-fullscreen-btn').style.display = 'none'
        }
        const p2 = document.querySelector('#enemy-stats-skin')
        // p2.style.backgroundImage = `url(${imageRivalCharacter.src})`
        document.querySelector('#enemy-character__btn-prev').addEventListener('click', () => {
          try {
            const keys = Object.keys(this.remotePlayers)
            const chosenEnemyId = localStorage.getItem('chosen_enemy_id')
            const index = keys.indexOf(chosenEnemyId)
            const mainKey = (index == -1 || index == 0) ? keys[keys.length-1] : keys[index-1]
            p2.style.backgroundImage = `url(${this.remotePlayersImages[mainKey]})`
            this.enemyStats(this.remotePlayersAddresses[mainKey])
            localStorage.setItem('chosen_enemy_id', mainKey)
          } catch (error) {
            console.log(error)
          }
        })
        document.querySelector('#enemy-character__btn-next').addEventListener('click', () => {
          try {
            const keys = Object.keys(this.remotePlayers)
            const chosenEnemyId = localStorage.getItem('chosen_enemy_id')
            const index = keys.indexOf(chosenEnemyId)
            const mainKey = (index == keys.length - 1) ? keys[0] : keys[index+1]
            p2.style.backgroundImage = `url(${this.remotePlayersImages[mainKey]})`
            this.enemyStats(this.remotePlayersAddresses[mainKey])
            localStorage.setItem('chosen_enemy_id', mainKey)
          } catch (error) {
            console.log(error)
          }
        })
        document.querySelector('#enemyStats-ton-previous').addEventListener('click', () => {
          try {
            const keys = Object.keys(this.remotePlayers)
            const chosenEnemyId = localStorage.getItem('chosen_enemy_id')
            const index = keys.indexOf(chosenEnemyId)
            const mainKey = (index == -1 || index == 0) ? keys[keys.length-1] : keys[index-1]
            p2.style.backgroundImage = `url(${this.remotePlayersImages[mainKey]})`
            this.enemyStats(this.remotePlayersAddresses[mainKey])
            localStorage.setItem('chosen_enemy_id', mainKey)
          } catch (error) {
            console.log(error)
          }
        })
        document.querySelector('#enemyStats-ton-next').addEventListener('click', () => {
          try {
            const keys = Object.keys(this.remotePlayers)
            const chosenEnemyId = localStorage.getItem('chosen_enemy_id')
            const index = keys.indexOf(chosenEnemyId)
            const mainKey = (index == keys.length - 1) ? keys[0] : keys[index+1]
            p2.style.backgroundImage = `url(${this.remotePlayersImages[mainKey]})`
            this.enemyStats(this.remotePlayersAddresses[mainKey])
            localStorage.setItem('chosen_enemy_id', mainKey)
          } catch (error) {
            console.log(error)
          }
        })
        document.querySelector('#finishGame').addEventListener('click', () => {
          window.location.href = (Network.chainid != 0 && Network.chainid != 999999) ? `/?network=${Network.chainid}` : '/ton'
        })
        try {
          const __deposit = localStorage.getItem(`deposit_${Network.chainid}_${GameID}`)
          yourDepAmount = ` ${this.calcAmountWithDecimals(__deposit, decimals)} FAIR`
          const yourDep = document.getElementById('yourDep')
          yourDep.textContent = yourDepAmount
          document.getElementById('finish_modal_your_address').textContent = address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length)
        } catch (error) {
          console.log(error)
        }

        const canvas = document.querySelector('#canvas');
        const touchStartEvent = new TouchEvent('touchstart', {
            touches: [new Touch({ identifier: 0, target: window, clientY: window.innerHeight })]
        });

        const touchMoveEvent = new TouchEvent('touchmove', {
            touches: [new Touch({ identifier: 0, target: window, clientY: 0 })]
        });

        const touchEndEvent = new TouchEvent('touchend', {
            touches: []
        });

        window.dispatchEvent(touchStartEvent);
        window.dispatchEvent(touchMoveEvent);
        window.dispatchEvent(touchEndEvent);
        function disableTouchScroll(e){
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        canvas.addEventListener('touchmove',disableTouchScroll)
      },
    
      playerShoot: function(typeOfBullet) {
        //звук в зависимости от типа пули
        var isFlip = this.player.flip;
        var x = this.player.pos.x + (isFlip ? -40 : 60);
        var y = this.player.pos.y + 20;
        
        // this.shootSound.play()
        // Spawn an entity, and broadcast about it
        ig.game.spawnEntity(EntityProjectile, x, y, {
          flip: isFlip,
          type: typeOfBullet
        });
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_SHOOT)
          .setX(x)
          .setY(y)
          .setFlip(isFlip)
          .setTypeOfBullet(typeOfBullet)
        );
      },
    
      playerDied: function(killerId) {
        var msg = MessageBuilder.createMessage(MESSAGE_DIED);
        if (killerId) {
          msg.setKillerId(killerId);
        }
        this.connection.broadcastMessage(msg.setKillerId(killerId));
        this.connection.playerDied(address, this.remotePlayersAddresses[killerId]);
        this.connection.updateBalance()
        const realBalance = localStorage.getItem('realBalance')
        const amountPerRound = localStorage.getItem('amountPerRound')
        const _balance = BigInt(realBalance) - BigInt(amountPerRound)
        if (_balance != undefined && _balance == 0 && killerId) {
          localStorage.setItem('realBalance', 0)
          const deposit = localStorage.getItem(`deposit_${Network.chainid}_${GameID}`)
          const balanceElement = document.querySelector('#yourDepTopBar')
          const deathsElement = document.querySelector('#yourDeathsTopBar')
          const winLoseElement = document.getElementById('yourAmountWinLose')
          const deathOverElement = document.getElementById('yourDeaths')
          let realDeath = parseInt(deathOverElement.textContent) + 1
          balanceElement.textContent = `0 ${token}`
          winLoseElement.className = 'red'
          winLoseElement.textContent = `Lose: -${this.calcAmountWithDecimals(deposit, decimals)} ${token}`
          deathsElement.textContent = realDeath
          deathOverElement.textContent = realDeath
          try {document.getElementById("canvas").style.display = 'none'} catch (error) {}
          try {document.getElementById("noCanvas").style.display = ''} catch (error) {}
          try {document.getElementById("wrapper__gradient_game").style.background = ''} catch (error) {}
          try {document.getElementById("loadingStage").style.display = 'inherit'} catch (error) {}
          try {document.getElementById("loadingStage").textContent = 'Finishing game'} catch (error) {}
          try {document.getElementById("over_modal").style.display = "flex";} catch (error) {}
        } else {
          this.spawnPlayer();
        }
      },

      onUserJoined: async function(user) {
        this.remotePlayersAddresses[`${user.userId}`] = user.walletAddress.toLowerCase() || user.user.walletAddress.toLowerCase()
        if (!this.remotePlayersImages[user.userId]) {
          let _rivalCharacter = new URLSearchParams();
          _rivalCharacter.append("address", this.remotePlayersAddresses[user.userId])
          _rivalCharacter.append("chainid", Network.chainid)
          _rivalCharacter.append("typeofimage", 'rival')
          const _rawResponse = await fetch('/getcharacterimage?' + _rivalCharacter)
          let _playerRivalImage = await _rawResponse.blob().catch(err => console.log(err))
          const _imageUrl = URL.createObjectURL(_playerRivalImage);
          const _image = new Image();
          _image.src = _imageUrl;
          const p2 = document.querySelector('#enemy-stats-skin')
          p2.style.backgroundImage = `url(${_image.src})`
          localStorage.setItem('chosen_enemy_id', user.userId)
          this.enemyStats(user.walletAddress || user.user.walletAddress)
          this.remotePlayersImages[user.userId] = _image.src
        }
      },

      onUpdateBalance: function(data) {
        try {
          const chosenEnemyId = localStorage.getItem('chosen_enemy_id')
          const chosenEnemy = this.remotePlayersAddresses[chosenEnemyId]
          if (data.usersStats) {
            data.usersStats.forEach(v => {
              try {
                this.setStatsLocalStorage(
                  v.address, v.balance, v.kills, v.deaths, v.address.toLowerCase() == chosenEnemy.toLowerCase(), data.remainingRounds, data.rounds)
              } catch (error) {
              }
            })
          } else {
            try {this.setStatsLocalStorage(data.address1, data.amount1, data.killsAddress1, data.deathsAddress1, data.address1.toLowerCase() == chosenEnemy.toLowerCase(), data.remainingRounds, data.rounds)} catch (error) {}
            try {this.setStatsLocalStorage(data.address2, data.amount2, data.killsAddress2, data.deathsAddress2, data.address2.toLowerCase() == chosenEnemy.toLowerCase(), data.remainingRounds, data.rounds)} catch (error) {}
          }
        } catch (error) {
          console.log(error)
        }
      },

      onLostAll: function(_address){
        if (address.toLowerCase() == _address.toLowerCase()) {
          window.location.href = `/?network=${Network.chainid}`
          try {document.getElementById("canvas").style.display = 'none'} catch (error) {}
          try {document.getElementById("noCanvas").style.display = ''} catch (error) {}
          try {document.getElementById("wrapper__gradient_game").style.background = ''} catch (error) {}
          try {document.getElementById("loadingStage").style.display = 'inherit'} catch (error) {}
          try {document.getElementById("loadingStage").textContent = 'Finishing game'} catch (error) {}
          try {document.getElementById("over_modal").style.display = "flex";} catch (error) {}
        } else {
          const userId = this.findKeyByValue(this.remotePlayersAddresses, _address.toLowerCase())
          if (userId) {
            try {
              this.remotePlayerLoading[userId] = false
              this.remotePlayerDied[userId] = true
              ig.game.removeEntity(this.remotePlayers[userId]);
              delete this.remotePlayers[userId]
              delete this.remotePlayersAddresses[userId]
              delete this.remotePlayersImages[userId]
              this.remoteKilledPlayers[userId] = _address
            } catch (error) {
              console.log(error)
            }
          }
        }
      },

      spawnPlayer: function() {
        var spawnPos = this.getRandomSpawnPos();
        this.prevPod = spawnPos
        this.player = this.spawnEntity(EntityPlayer, spawnPos.x, spawnPos.y, {mapID: MapID, image: imageCharacter.src});
        this.player.health += inventory.health_bonus == null ? 0 : inventory.health_bonus * 10
        this.player.setHealth(this.player.health)
        this.player.weaponsLeft += inventory.bullets_bonus == null ? 0 : inventory.bullets_bonus
        this.player.setAmmunition(this.player.weaponsLeft)
        this.player.MAX_WEAPONS += inventory.bullets_bonus == null ? 0 : inventory.bullets_bonus
        this.player.jump += inventory.jump_bonus == null ? 0 : inventory.jump_bonus
        this.player.maxVel.x += inventory.speed_bonus == null ? 0 : inventory.speed_bonus
        this.player.canDoubleJump = inventory.jump_bonus || inventory.speed_bonus ? true : false
      },

      findKeyByValue: function(obj, value) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key) && obj[key] === value) {
                return key;
            }
        }
        return null;
      },
    
      getRandomSpawnPos: function() {
        var pods = ig.game.getEntitiesByType(EntityRespawnPod);
        var pod;
        do {
            pod = pods[Number.random(0, pods.length - 1)];
        } while (pod.getSpawnPos() === this.prevPod);
        
        return pod.getSpawnPos();
      },
    
      onUserLeave: function(user) {
        var remotePlayer = this.remotePlayers[user.userId];
        if (remotePlayer) {
          try {
            remotePlayer.kill();
            this.remotePlayerLoading[user.userId] = false
            ig.game.removeEntity(this.remotePlayers[user.userId]);
            delete this.remotePlayers[user.userId];
            delete this.remotePlayersAddresses[user.userId]
            delete this.remotePlayersImages[user.userId]
          } catch (error) {
            console.log(error)
          }
        }
      },
    
      onPeerMessage: async function(message, user, peer) {
        var remotePlayer = this.remotePlayers[user.userId];
        const wallet = user.walletAddress || user.user.walletAddress
        if (
          !remotePlayer && message.getType() === MESSAGE_STATE && !this.remoteKilledPlayers[user.userId] && !this.remotePlayerLoading[user.userId]
          && !this.remotePlayerDied[user.userId]
          ) { 
          this.remotePlayerLoading[user.userId] = true      
          if (!this.remotePlayersImages[user.userId]) {
            let _rivalCharacter = new URLSearchParams();
            _rivalCharacter.append("address", wallet)
            _rivalCharacter.append("chainid", Network.chainid)
            _rivalCharacter.append("typeofimage", 'rival')
            const _rawResponse = await fetch('/getcharacterimage?' + _rivalCharacter)
            let _playerRivalImage = await _rawResponse.blob().catch(err => console.log(err))
            const _imageUrl = URL.createObjectURL(_playerRivalImage);
            const _image = new Image();
            _image.src = _imageUrl;
            this.remotePlayersImages[user.userId] = _image.src
            this.remotePlayersAddresses[user.userId] = wallet.toLowerCase()
            const p2 = document.querySelector('#enemy-stats-skin')
            p2.style.backgroundImage = `url(${_image.src})`
            localStorage.setItem('chosen_enemy_id', user.userId)
            this.enemyStats(wallet)
          }
          remotePlayer = this.spawnRemotePlayer(user, message.getX(), message.getY());
          log('%cCreated remote player for %d', 'color: blue;', user.userId);
          if (localStorage.getItem('realBalance') != '0') {
            document.getElementById("canvas").style.display = ''
            document.getElementById("noCanvas").style.display = 'none'
            document.getElementById("wainting_modal").style.display = 'none'
          }
          const winLoseAmount = document.getElementById(`enemyAmountWinLose_${wallet.toLowerCase()}_balance_${Network.chainid}_${GameID}`)
          const overModalBody = document.getElementById('over-modal-body')
          let yourDepAmount
          try {
            const __deposit = localStorage.getItem(`deposit_${Network.chainid}_${GameID}`)
            yourDepAmount = ` ${this.calcAmountWithDecimals(__deposit, decimals)} FAIR`
          } catch (error) {
            yourDepAmount = document.getElementById('yourDep').textContent
          }
          if (!winLoseAmount) {
            const finishStatsElements = document.querySelectorAll('.finish-stats')
            // const divider = document.createElement('div')
            // divider.classList.add('stats-divider')
            // overModalBody.appendChild(divider)
            const walletKillsStorage = localStorage.getItem(`${wallet.toLowerCase()}_kills_${Network.chainid}_${GameID}`)
            const walletDeathsStorage = localStorage.getItem(`${wallet.toLowerCase()}_deaths_${Network.chainid}_${GameID}`)
            const walletBalanceStorage = localStorage.getItem(`${wallet.toLowerCase()}_balance_${Network.chainid}_${GameID}`)
            const depositStorage = localStorage.getItem(`deposit_${Network.chainid}_${GameID}`)
            let winLoseName, winLoseClassName, amountShortFloat
            if (walletBalanceStorage) {
              const balanceBigInt = BigInt((walletBalanceStorage.split(' ')[0] * 10**parseInt(decimals)))
              const deposit = BigInt(depositStorage)
              const balanceRight = balanceBigInt - deposit
              if (balanceBigInt > deposit) winLoseName = 'Win', winLoseClassName = 'green'
              if (balanceBigInt == deposit) winLoseName = 'Win', winLoseClassName = 'orange'
              if (balanceBigInt < deposit) winLoseName = 'Lose', winLoseClassName = 'red'
              amountShortFloat = this.shortFloat(this.calcAmountWithDecimals(balanceRight, decimals))
            }
            if (finishStatsElements.length % 2 == 0) {
              //you
              const finishStatsDiv = document.createElement("div");
              finishStatsDiv.classList.add("finish-stats");
              overModalBody.appendChild(finishStatsDiv)

              const yourStatsHeaderDiv = document.createElement("div");
              yourStatsHeaderDiv.classList.add("yourStats__header");
              const yourStatsHeaderP = document.createElement("p");
              yourStatsHeaderP.textContent = `Enemy #${finishStatsElements.length}`;
              yourStatsHeaderDiv.appendChild(yourStatsHeaderP);

              const yourStatsDiv = document.createElement("div");
              yourStatsDiv.classList.add("yourStats");

              const amountWinLose = document.createElement("span");
              amountWinLose.id = `enemyAmountWinLose_${wallet.toLowerCase()}_balance_${Network.chainid}_${GameID}`
              if (amountShortFloat) {
                amountWinLose.textContent = `${winLoseName}: ${amountShortFloat} ${token}`
                amountWinLose.className = winLoseClassName
              }

              const yourKillsStatDiv = document.createElement("div");
              yourKillsStatDiv.classList.add("yourKills_stat");
              const yourKillsTitleSpan = document.createElement("span");
              yourKillsTitleSpan.classList.add("yourKillsTitle");
              yourKillsTitleSpan.textContent = "Kills:";
              const yourKillsSpan = document.createElement("span");
              yourKillsSpan.classList.add("yourKills");
              yourKillsSpan.id = `${wallet.toLowerCase()}_kills_${Network.chainid}_${GameID}`
              yourKillsSpan.textContent = ' 0'
              if (walletKillsStorage) yourKillsSpan.textContent = ` ${walletKillsStorage}`
              yourKillsStatDiv.appendChild(yourKillsTitleSpan);
              yourKillsStatDiv.appendChild(yourKillsSpan);

              const yourDepStatDiv = document.createElement("div");
              yourDepStatDiv.classList.add("yourDep_stat");
              const yourDepTitleSpan = document.createElement("span");
              yourDepTitleSpan.classList.add("yourDepTitle");
              yourDepTitleSpan.textContent = "Dep:";
              const yourDepSpan = document.createElement("span");
              yourDepSpan.textContent = yourDepAmount
              yourDepStatDiv.appendChild(yourDepTitleSpan);
              yourDepStatDiv.appendChild(yourDepSpan);

              const yourDeathsStatDiv = document.createElement("div");
              yourDeathsStatDiv.classList.add("yourDeaths_stat");
              const yourDeathsTitleSpan = document.createElement("span");
              yourDeathsTitleSpan.classList.add("yourDeathsTitle");
              yourDeathsTitleSpan.textContent = "Deaths:";
              const yourDeathsSpan = document.createElement("span");
              yourDeathsSpan.classList.add("yourDeaths");
              yourDeathsSpan.textContent = ' 0'
              if (walletDeathsStorage) yourDeathsSpan.textContent = ` ${walletDeathsStorage}`
              yourDeathsSpan.id = `${wallet.toLowerCase()}_deaths_${Network.chainid}_${GameID}`
              yourDeathsStatDiv.appendChild(yourDeathsTitleSpan);
              yourDeathsStatDiv.appendChild(yourDeathsSpan);

              const yourStatsAddressDiv = document.createElement("div");
              yourStatsAddressDiv.classList.add("yourStats_address");
              const yourAddressSpan = document.createElement("span");
              yourAddressSpan.classList.add("your_address");
              yourAddressSpan.textContent = "Wallet: ";
              const yourAddressLink = document.createElement("a");
              yourAddressLink.className = 'finish_modal_your_address'
              try {
                yourAddressLink.textContent = wallet.slice(0, 6) + '...' + wallet.slice(wallet.length - 4, wallet.length)
              } catch (error) {
                yourAddressLink.textContent = wallet
              }
              yourStatsAddressDiv.appendChild(yourAddressSpan);
              yourStatsAddressDiv.appendChild(yourAddressLink);

              // Добавление элементов в DOM
              finishStatsDiv.appendChild(yourStatsHeaderDiv);
              yourStatsDiv.appendChild(amountWinLose);
              yourStatsDiv.appendChild(yourKillsStatDiv);
              yourStatsDiv.appendChild(yourDepStatDiv);
              yourStatsDiv.appendChild(yourDeathsStatDiv);
              finishStatsDiv.appendChild(yourStatsDiv)
              finishStatsDiv.appendChild(yourStatsAddressDiv);
            } else {
              //enemy
              const finishStatsEnemy = document.createElement('div')
              finishStatsEnemy.className = 'finish-stats_enemy finish-stats'
              overModalBody.appendChild(finishStatsEnemy)
              const enemyStatsHeader = document.createElement('div')
              enemyStatsHeader.className = 'enemyStats__header'
              const enemyStatsHeaderText = document.createElement('p')
              enemyStatsHeaderText.textContent = `Enemy #${finishStatsElements.length}`
              enemyStatsHeader.appendChild(enemyStatsHeaderText)
              finishStatsEnemy.appendChild(enemyStatsHeader)

              const enemyStats = document.createElement('div')
              enemyStats.className = 'enemyStats'
              const enemyKillsStat = document.createElement('div')
              enemyKillsStat.className = 'enemyKills_stat'
              const enemyKillsTitle = document.createElement('span')
              enemyKillsTitle.className = 'enemyKillsTitle'
              enemyKillsTitle.textContent = 'Kills:'
              const enemyKillsValue = document.createElement('span')
              enemyKillsValue.className = 'enemyKills'
              enemyKillsValue.id = `${wallet.toLowerCase()}_kills_${Network.chainid}_${GameID}`
              enemyKillsValue.textContent = ' 0'
              if (walletKillsStorage) enemyKillsValue.textContent = ` ${walletKillsStorage}`
              enemyKillsStat.appendChild(enemyKillsTitle)
              enemyKillsStat.appendChild(enemyKillsValue)
              enemyStats.appendChild(enemyKillsStat)
              const enemyAmountWinLose = document.createElement('span')
              enemyAmountWinLose.id = `enemyAmountWinLose_${wallet.toLowerCase()}_balance_${Network.chainid}_${GameID}`
              if (amountShortFloat) {
                enemyAmountWinLose.textContent = `${winLoseName}: ${amountShortFloat} ${token}`
                enemyAmountWinLose.className = winLoseClassName
              }
              enemyStats.appendChild(enemyAmountWinLose)
              const enemyDeathsStat = document.createElement('div')
              enemyDeathsStat.className = 'enemyDeaths_stat'
              const enemyDeathsTitle = document.createElement('span')
              enemyDeathsTitle.className = 'enemyDeathsTitle'
              enemyDeathsTitle.textContent = 'Deaths:'
              const enemyDeathsValue = document.createElement('span')
              enemyDeathsValue.className = 'enemyDeaths'
              enemyDeathsValue.id = `${wallet.toLowerCase()}_deaths_${Network.chainid}_${GameID}`
              enemyDeathsValue.textContent = ' 0'
              if (walletDeathsStorage) enemyDeathsValue.textContent = ` ${walletDeathsStorage}`
              enemyDeathsStat.appendChild(enemyDeathsTitle)
              enemyDeathsStat.appendChild(enemyDeathsValue)
              enemyStats.appendChild(enemyDeathsStat)
              const enemyDepStat = document.createElement('div')
              enemyDepStat.className = 'enemyDep_stat'
              const enemyDepTitle = document.createElement('span')
              enemyDepTitle.className = 'enemyDepTitle'
              enemyDepTitle.textContent = 'Dep:'
              const enemyDepValue = document.createElement('span')
              enemyDepValue.textContent = yourDepAmount
              enemyDepStat.appendChild(enemyDepTitle)
              enemyDepStat.appendChild(enemyDepValue)
              enemyStats.appendChild(enemyDepStat)
              finishStatsEnemy.appendChild(enemyStats)

              const enemyStatsAddress = document.createElement('div')
              enemyStatsAddress.className = 'enemyStats_address'
              const enemyAddressTitle = document.createElement('span')
              enemyAddressTitle.className = 'enemy_address'
              enemyAddressTitle.textContent = ' Wallet: '
              const enemyAddressValue = document.createElement('a')
              try {
                enemyAddressValue.textContent = wallet.slice(0, 6) + '...' + wallet.slice(wallet.length - 4, wallet.length) 
              } catch (error) {
                enemyAddressValue.textContent = wallet 
              }
              enemyAddressValue.className = 'finish_modal_enemy_address'
              enemyStatsAddress.appendChild(enemyAddressTitle)
              enemyStatsAddress.appendChild(enemyAddressValue)
              finishStatsEnemy.appendChild(enemyStatsAddress)
            }
          }
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
          
          case MESSAGE_COLLECT_TELEPORT: 
            this.onRemotePlayerCollectedTeleport(remotePlayer, message)
            break;

          case MESSAGE_COLLECT_MOLE: 
            this.onRemotePlayerCollectedMole(remotePlayer, message)
            break;

          case MESSAGE_COLLECT_INVISIBLE: 
            this.onRemotePlayerCollectedInvisible(remotePlayer, message)
            break;

          case MESSAGE_COLLECT_DYNAMITE: 
            this.onRemotePlayerCollectedDynamite(remotePlayer, message, user)
            break;

          case MESSAGE_COLLECT_STUN: 
            this.onRemotePlayerCollectedStun(remotePlayer, message, user)
            break;
          
          case MESSAGE_COLLECT_BURSTING: 
            this.onRemotePlayerCollectedBursting(remotePlayer, message, user)
            break;

          case MESSAGE_COLLECT_IGNITING: 
            this.onRemotePlayerCollectedIgniting(remotePlayer, message, user)
            break;
          
          case MESSAGE_COLLECT_SHIELD: 
            this.onRemotePlayerCollectedShield(remotePlayer, message, user)
            break;
        }
      },

      setStatsLocalStorage: function(player, balance, kills, deaths, isChosenEnemy, remainingRounds, rounds) {
        try {
          const writtenBalance = `${this.shortFloat(this.calcAmountWithDecimals(balance, decimals))} ${token}`
          let _rounds = 0
          if (rounds) _rounds = parseInt(rounds) - parseInt(remainingRounds)
          document.getElementById("rounds_amount").textContent = `${_rounds}/${rounds}`
          const balanceBigInt = BigInt(balance.toString())
          const deposit = BigInt(localStorage.getItem(`deposit_${Network.chainid}_${GameID}`))
          const balanceRight = balanceBigInt - deposit
          let winLoseName, winLoseClassName
          if (balanceBigInt > deposit) winLoseName = 'Win', winLoseClassName = 'green'
          if (balanceBigInt == deposit) winLoseName = 'Win', winLoseClassName = 'orange'
          if (balanceBigInt < deposit) winLoseName = 'Lose', winLoseClassName = 'red'
          const amountShortFloat = this.shortFloat(this.calcAmountWithDecimals(balanceRight, decimals))
          if(player.toLowerCase() != address.toLowerCase()) {
            localStorage.setItem(`${player.toLowerCase()}_balance_${Network.chainid}_${GameID}`, writtenBalance)
            localStorage.setItem(`${player.toLowerCase()}_kills_${Network.chainid}_${GameID}`, kills)
            localStorage.setItem(`${player.toLowerCase()}_deaths_${Network.chainid}_${GameID}`, deaths)
            if (isChosenEnemy) {
              const enemyKillsLive = document.querySelector('#enemyKillsLive')
              const enemyDeathsLive = document.querySelector('#enemyDeathsLive')
              const enemyDepTopBar = document.querySelector('#enemyDepTopBar')
              enemyKillsLive.textContent = kills
              enemyDeathsLive.textContent = deaths
              enemyDepTopBar.textContent = writtenBalance
            }
            document.getElementById(`${player.toLowerCase()}_kills_${Network.chainid}_${GameID}`).textContent = ` ${kills}`
            document.getElementById(`${player.toLowerCase()}_deaths_${Network.chainid}_${GameID}`).textContent = ` ${deaths}`
            const winloseElement = document.getElementById(`enemyAmountWinLose_${player.toLowerCase()}_balance_${Network.chainid}_${GameID}`)
            winloseElement.textContent = `${winLoseName}: ${amountShortFloat} ${token}`
            winloseElement.className = winLoseClassName
            if (balance == '0') {
              const userId = this.findKeyByValue(this.remotePlayersAddresses, player.toLowerCase())
              if (userId) {
                try {
                  this.remotePlayerLoading[userId] = false
                  this.remotePlayerDied[userId] = true
                  ig.game.removeEntity(this.remotePlayers[userId]);
                  delete this.remotePlayers[userId]
                  delete this.remotePlayersAddresses[userId]
                  delete this.remotePlayersImages[userId]
                  this.remoteKilledPlayers[userId] = player.toLowerCase()
                } catch (error) {
                  console.log(error)
                }
              }
            }
          } else {
            localStorage.setItem('realBalance', balance)
            if (balance == '0' || remainingRounds == '0') {
              try {document.getElementById("canvas").style.display = 'none'} catch (error) {}
              try {document.getElementById("noCanvas").style.display = ''} catch (error) {}
              try {document.getElementById("wrapper__gradient_game").style.background = ''} catch (error) {}
              try {document.getElementById("loadingStage").style.display = 'inherit'} catch (error) {}
              try {document.getElementById("loadingStage").textContent = 'Finishing game'} catch (error) {}
              try {document.getElementById("over_modal").style.display = "flex";} catch (error) {}
              try {document.getElementById("sure_want_end").style.display = 'none'} catch (error) {}
            }
            const balanceElement = document.querySelector('#yourDepTopBar')
            const killsElement = document.querySelector('#yourKillsTopBar')
            const deathsElement = document.querySelector('#yourDeathsTopBar')
            balanceElement.textContent = writtenBalance
            killsElement.textContent = kills
            deathsElement.textContent = deaths
            document.getElementById('yourKills').textContent = kills
            document.getElementById('yourDeaths').textContent = deaths
            const winLoseElement = document.getElementById('yourAmountWinLose')
            winLoseElement.textContent = `${winLoseName}: ${amountShortFloat} ${token}`
            winLoseElement.className = winLoseClassName
            const balanceTon = document.querySelector('#yourStats-ton-balance')
            const killsTon = document.querySelector('#yourStats-ton-kills')
            const deathsTon = document.querySelector('#yourStats-ton-death')
            const balanceFinishTon = document.querySelector('#yourFinishBalance-ton')
            balanceTon.textContent = writtenBalance
            killsTon.textContent = kills
            deathsTon.textContent = deaths
            balanceFinishTon.textContent = writtenBalance
          }
        } catch (error) {
          console.log(error)
        }
      },

      calcAmountWithDecimals: function (amount, decimals) {
        return parseInt(amount) / 10**parseInt(decimals)
      },

      shortFloat: function(value) {
        if (!Number.isInteger(value)) {
          let valueAsString = value.toFixed(10)
          return parseFloat(valueAsString)
        }
        return value
      },

      enemyStats: function(player) {
        const balance = localStorage.getItem(`${player.toLowerCase()}_balance_${Network.chainid}_${GameID}`)
        const kills = localStorage.getItem(`${player.toLowerCase()}_kills_${Network.chainid}_${GameID}`)
        const deaths = localStorage.getItem(`${player.toLowerCase()}_deaths_${Network.chainid}_${GameID}`)
        document.querySelector('#enemyDepTopBar').textContent = balance
        document.querySelector('#enemyKillsLive').textContent = kills
        document.querySelector('#enemyDeathsLive').textContent = deaths
        document.querySelector('#enemyStats-ton-balance').textContent = balance
        document.querySelector('#enemyStats-ton-kills').textContent = kills
        document.querySelector('#enemyStats-ton-death').textContent = deaths
      },
    
      spawnRemotePlayer: function(user, x, y) {
        this.remotePlayers[user.userId] = this.spawnEntity(EntityRemotePlayer, x, y, {image: this.remotePlayersImages[user.userId] || imageRivalCharacter.src, walletAddress: user.walletAddress})
        // this.remotePlayersAddresses[user.userId] = user.walletAddress
        return this.remotePlayers[user.userId];
      },
     
      onPlayerState: function(remotePlayer, message) {
        try {
          remotePlayer.setState(message);
        } catch (error) {
        }
      },
    
      onPlayerDied: function(remotePlayer, message, user) {
        // console.log('Died', remotePlayer, message, user)
        if (user !== undefined) {
          // if (user.walletAddress !== undefined) {
          //   this.connection.playerDied(user.walletAddress, this.remotePlayersAddresses[message.getKillerId()]);
          // } else {
          //   this.connection.playerDied(user.user.walletAddress, this.remotePlayersAddresses[message.getKillerId()]);
          // }
        }
        if (remotePlayer) {
          remotePlayer.kill();
        }
        this.remotePlayerLoading[user.userId] = false
        delete this.remotePlayers[user.userId];
      },
    
      onPlayerShoot: function(remotePlayer, message, user) {
        ig.game.spawnEntity(EntityProjectileRemote, message.getX(), message.getY(), {
          flip: message.getFlip(),
          type: message.getTypeOfBullet(),
          userId: user.userId
        });
      },

      onRemotePlayerCollectedDynamite: function(remotePlayer, message, user) {
        ig.game.spawnEntity(EntityDynamiteRemote, message.getX(), message.getY(), {
          flip: message.getFlip(),
          userId: user.userId
        });
        this.onDynamiteCollected(message.getDynamiteId());
      },
    
      onRemotePlayerCollectedWeapon: function(remotePlayer, message) {
        this.onWeaponCollected(message.getWeaponId());
      },
    
      onRemotePlayerFragCount: function(remotePlayer, message, user) {
        this.setTextMessage('Player ' + user.userId + ' has ' + message.getFragCount() + ' frags!!');
      },
    
      onPlayerCollectedWeapon: function(weapon) {
        // this.takeSound.play()
        this.player.addWeapons(this.WEAPON_PER_TUBE);
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_WEAPON)
          .setWeaponId(weapon.weaponId)
        );
        this.onWeaponCollected(weapon.weaponId);
      },

      onPlayerCollectedTeleport: function(teleport) {
        this.player.useTeleport(teleport.teleportId, MapID)
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_TELEPORT)
          .setTeleportId(teleport.teleportId)
        );
        this.onTeleportCollected(teleport.teleportId);
      },

      onPlayerCollectedMole: function(mole) {
        this.player.useMole(mole.moleId, MapID);
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_MOLE)
          .setMoleId(mole.moleId)
        );
        this.onMoleCollected(mole.moleId);
      },

      onPlayerCollectedInvisible: function(invisible) {
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_INVISIBLE)
          .setInvisibleId(invisible.invisibleId)
        );
        this.onInvisibleCollected(invisible.invisibleId);
      },

      onPlayerCollectedShield: function(shield) {
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_SHIELD).setShieldId(shield.shieldId)
        )
        this.onShieldCollected(shield.shieldId);
        ig.game.player.damageReceiver = true
        setTimeout(() => {
          ig.game.player.damageReceiver = false
        }, 5000)
      },

      onPlayerCollectedBurstingBulletStatic: function (bursting) {
        this.player.currentTypeOfBullet = 1
        setTimeout(() => {
          this.player.currentTypeOfBullet = 0
        }, 10000)
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_BURSTING)
          .setBurstingId(bursting.burstingId)
        );
        this.onBurstingCollected(bursting.burstingId);
      },

      onPlayerCollectedIgnitingBulletStatic: function (igniting) {
        this.player.currentTypeOfBullet = 2
        setTimeout(() => {
          this.player.currentTypeOfBullet = 0
        }, 10000)
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_IGNITING)
          .setIgnitingId(igniting.ignitingId)
        );
        this.onIgnitingCollected(igniting.ignitingId);
      },

      onPlayerCollectedDynamiteStatic: function(dynamite) {
        var isFlip = this.player.flip;
        var x = dynamite.pos.x;
        var y = dynamite.pos.y;
    
        // Spawn an entity, and broadcast about it
        ig.game.spawnEntity(EntityDynamite, x, y, {
          flip: isFlip
        });
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_DYNAMITE)
          .setX(x)
          .setY(y)
          .setFlip(isFlip)
          .setDynamiteId(dynamite.dynamiteId)
        );
        this.onDynamiteCollected(dynamite.dynamiteId);
      },

      onDynamiteCollected: function(dynamiteId) {
        var dynamite = ig.game.getEntitiesByType(EntityDynamiteStatic).find(function(dynamite) {
          return dynamite.dynamiteId === dynamiteId;
        });
        if (dynamite) {
          dynamite.kill();
          this.spawnDynamiteQueue.push([dynamite, ig.Timer.time]);
        }
      },

      spawnDynamites: function() {
        while (this.spawnDynamiteQueue.length) {
          var delta = ig.Timer.time - this.spawnDynamiteQueue[0][1];
          if (delta < this.DYNAMITE_RESPAWN_TIME) {
            break;
          }
          var dynamite = this.spawnDynamiteQueue.pop()[0];
          ig.game.spawnEntity(EntityDynamiteStatic, dynamite.pos.x, dynamite.pos.y, {
            dynamiteId: dynamite.dynamiteId
          });
        }
      },

      onRemotePlayerCollectedStun: function(remotePlayer, message, user) {
        ig.game.spawnEntity(EntityStunRemote, message.getX(), message.getY(), {
          flip: message.getFlip(),
          userId: user.userId
        });
        this.onStunCollected(message.getStunId());
      },


      onPlayerCollectedStunStatic: function(stun) {
        var isFlip = this.player.flip;
        var x = stun.pos.x;
        var y = stun.pos.y;
    
        // Spawn an entity, and broadcast about it
        ig.game.spawnEntity(EntityStun, x, y, {
          flip: isFlip
        });
        this.connection.broadcastMessage(MessageBuilder.createMessage(MESSAGE_COLLECT_STUN)
          .setX(x)
          .setY(y)
          .setFlip(isFlip)
          .setStunId(stun.stunId)
        );
        this.onStunCollected(stun.stunId);
      },

      onStunCollected: function(stunId) {
        var stun = ig.game.getEntitiesByType(EntityStunStatic).find(function(stun) {
          return stun.stunId === stunId;
        });
        if (stun) {
          stun.kill();
          this.spawnStunQueue.push([stun, ig.Timer.time]);
        }
      },

      spawnStuns: function() {
        while (this.spawnStunQueue.length) {
          var delta = ig.Timer.time - this.spawnStunQueue[0][1];
          if (delta < this.STUN_RESPAWN_TIME) {
            break;
          }
          var stun = this.spawnStunQueue.pop()[0];
          ig.game.spawnEntity(EntityStunStatic, stun.pos.x, stun.pos.y, {
            stunId: stun.stunId
          });
        }
      },
      
      onRemotePlayerCollectedTeleport: function(remotePlayer, message) {
        this.onTeleportCollected(message.getTeleportId());
      },

      onRemotePlayerCollectedMole: function(remotePlayer, message) {
        this.onMoleCollected(message.getMoleId());
      },

      onRemotePlayerCollectedBursting: function(remotePlayer, message) {
        this.onBurstingCollected(message.getBurstingId());
      },

      onRemotePlayerCollectedIgniting: function(remotePlayer, message) {
        this.onIgnitingCollected(message.getIgnitingId());
      },

      onRemotePlayerCollectedInvisible: function(remotePlayer, message) {
        this.onInvisibleCollected(message.getInvisibleId());
        remotePlayer.animSheet.image = new ig.Image('');
        setTimeout(() => {
          remotePlayer.animSheet.image = new ig.Image(remotePlayer.image);
        }, 5000)
      },

      onRemotePlayerCollectedShield: function(remotePlayer, message) {
        this.onShieldCollected(message.getShieldId());
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

      onTeleportCollected: function(teleportId) {
        var teleport = ig.game.getEntitiesByType(EntityTeleport).find(function(teleport) {
          return teleport.teleportId === teleportId;
        });
        if (teleport) {
          teleport.kill();
          this.spawnTeleportQueue.push([teleport, ig.Timer.time]);
        }
      },
    
      spawnTeleports: function() {
        while (this.spawnTeleportQueue.length) {
          var delta = ig.Timer.time - this.spawnTeleportQueue[0][1];
          if (delta < this.TELEPORT_RESPAWN_TIME) {
            break;
          }
          var teleport = this.spawnTeleportQueue.pop()[0];
          ig.game.spawnEntity(EntityTeleport, teleport.pos.x, teleport.pos.y, {
            teleportId: teleport.teleportId
          });
        }
      },

      onMoleCollected: function(moleId) {
        var mole = ig.game.getEntitiesByType(EntityMole).find(function(mole) {
          return mole.moleId === moleId;
        });
        if (mole) {
          mole.kill();
          this.spawnMoleQueue.push([mole, ig.Timer.time]);
        }
      },

      spawnMoles: function() {
        while (this.spawnMoleQueue.length) {
          var delta = ig.Timer.time - this.spawnMoleQueue[0][1];
          if (delta < this.MOLE_RESPAWN_TIME) {
            break;
          }
          var mole = this.spawnMoleQueue.pop()[0];
          ig.game.spawnEntity(EntityMole, mole.pos.x, mole.pos.y, {
            moleId: mole.moleId
          });
        }
      },

      onInvisibleCollected: function(invisibleId) {
        var invisible = ig.game.getEntitiesByType(EntityInvisible).find(function(invisible) {
          return invisible.invisibleId === invisibleId;
        });
        if (invisible) {
          invisible.kill();
          this.spawnInvisibleQueue.push([invisible, ig.Timer.time]);
        }
      },

      spawnInvisibles: function() {
        while (this.spawnInvisibleQueue.length) {
          var delta = ig.Timer.time - this.spawnInvisibleQueue[0][1];
          if (delta < this.INVISIBLE_RESWAWN_TIME) {
            break;
          }
          var invisible = this.spawnInvisibleQueue.pop()[0];
          ig.game.spawnEntity(EntityInvisible, invisible.pos.x, invisible.pos.y, {
            invisibleId: invisible.invisibleId
          });
        }
      },

      onShieldCollected: function(shieldId) {
        var shield = ig.game.getEntitiesByType(EntityShield).find(function(shield) {
          return shield.shieldId === shieldId;
        });
        if (shield) {
          shield.kill();
          this.spawnShieldQueue.push([shield, ig.Timer.time]);
        }
      },
    
      spawnShields: function() {
        while (this.spawnShieldQueue.length) {
          var delta = ig.Timer.time - this.spawnShieldQueue[0][1];
          if (delta < this.SHIELD_RESPAWN_TIME) {
            break;
          }
          var shield = this.spawnShieldQueue.pop()[0];
          ig.game.spawnEntity(EntityShield, shield.pos.x, shield.pos.y, {
            shieldId: shield.shieldId
          });
        }
      },

      onBurstingCollected: function(burstingId) {
        var bursting = ig.game.getEntitiesByType(EntityBurstingBulletStatic).find(function(bursting) {
          return bursting.burstingId === burstingId;
        });
        if (bursting) {
          bursting.kill();
          this.spawnBurstingQueue.push([bursting, ig.Timer.time]);
        }
      },

      spawnBurstings: function() {
        while (this.spawnBurstingQueue.length) {
          var delta = ig.Timer.time - this.spawnBurstingQueue[0][1];
          if (delta < this.BURSTING_RESWAWN_TIME) {
            break;
          }
          var bursting = this.spawnBurstingQueue.pop()[0];
          ig.game.spawnEntity(EntityBurstingBulletStatic, bursting.pos.x, bursting.pos.y, {
            burstingId: bursting.burstingId
          });
        }
      },

      onIgnitingCollected: function(ignitingId) {
        var igniting = ig.game.getEntitiesByType(EntityIgnitingBulletStatic).find(function(igniting) {
          return igniting.ignitingId === ignitingId;
        });
        if (igniting) {
          igniting.kill();
          this.spawnIgnitingQueue.push([igniting, ig.Timer.time]);
        }
      },

      spawnIgnitings: function() {
        while (this.spawnIgnitingQueue.length) {
          var delta = ig.Timer.time - this.spawnIgnitingQueue[0][1];
          if (delta < this.IGNITING_RESPAWN_TIME) {
            break;
          }
          var igniting = this.spawnIgnitingQueue.pop()[0];
          ig.game.spawnEntity(EntityIgnitingBulletStatic, igniting.pos.x, igniting.pos.y, {
            ignitingId: igniting.ignitingId
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
        this.spawnTeleports();
        this.spawnMoles();
        this.spawnInvisibles();
        this.spawnDynamites();
        this.spawnStuns();
        this.spawnBurstings();
        this.spawnIgnitings();
        this.spawnShields();
      },
    
      draw: function() {// Clear before everything!
        ig.system.clear( this.hackyClearColor );
    
        // Background            
        this.background.draw(0,0);
        // Draw all entities and backgroundMaps
        this.parent();
        if (window.showMinimap) {
          this.drawMiniMap("minimap", 0, ig.ua.mobile ? chosenMap.minimapPlaceMobile.y : chosenMap.minimapPlace.y, ["EntityPlayer", "EntityRemotePlayer"]);
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
          FIELD_FLIP,
          FIELD_TYPE_OF_BULLET
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_WEAPON, [
          FIELD_TYPE,
          FIELD_WEAPON_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_TELEPORT, [
          FIELD_TYPE,
          FIELD_TELEPORT_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_MOLE, [
          FIELD_TYPE,
          FIELD_MOLE_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_INVISIBLE, [
          FIELD_TYPE,
          FIELD_INVISIBLE_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_SHIELD, [
          FIELD_TYPE,
          FIELD_SHIELD_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_BURSTING, [
          FIELD_TYPE,
          FIELD_BURSTING_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_IGNITING, [
          FIELD_TYPE,
          FIELD_IGNITING_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_FRAG_COUNT, [
          FIELD_TYPE,
          FIELD_FRAG_COUNT
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_DYNAMITE, [
          FIELD_TYPE,
          FIELD_X,
          FIELD_Y,
          FIELD_FLIP,
          FIELD_DYNAMITE_ID
        ]);
        MessageBuilder.registerMessageType(MESSAGE_COLLECT_STUN, [
          FIELD_TYPE,
          FIELD_X,
          FIELD_Y,
          FIELD_FLIP,
          FIELD_STUN_ID
        ]);
      },
    
      onJoinedRoom: async function(roomInfo) {
        console.log('%cJoined room', 'color: green', roomInfo);
        for (let i = 0; i < roomInfo.users.length; i++) {
          const walletAddress = roomInfo.users[i].walletAddress || roomInfo.users[i].user.walletAddress
          MyGame.prototype.remotePlayersAddresses[`${roomInfo.users[i].userId}`] = walletAddress.toLowerCase()
          if (!MyGame.prototype.remotePlayersImages[roomInfo.users[i].userId] && walletAddress.toLowerCase() != address.toLowerCase()) {
            let _rivalCharacter = new URLSearchParams();
            _rivalCharacter.append("address", MyGame.prototype.remotePlayersAddresses[roomInfo.users[i].userId])
            _rivalCharacter.append("chainid", Network.chainid)
            _rivalCharacter.append("typeofimage", 'rival')
            const _rawResponse = await fetch('/getcharacterimage?' + _rivalCharacter)
            let _playerRivalImage = await _rawResponse.blob().catch(err => console.log(err))
            const _imageUrl = URL.createObjectURL(_playerRivalImage);
            const _image = new Image();
            _image.src = _imageUrl;
            MyGame.prototype.remotePlayersImages[roomInfo.users[i].userId] = _image.src
            const p2 = document.querySelector('#enemy-stats-skin')
            p2.style.backgroundImage = `url(${_image.src})`
            localStorage.setItem('chosen_enemy_id', roomInfo.users[i].userId)
            this.enemyStats(walletAddress)
          }
        }
        ig.main('#canvas', MyGame, 60, chosenMap.x / chosenMap.reduceSizeX, chosenMap.y / chosenMap.reduceSizeY, ig.ua.mobile ? 0.5 : 3);
        
        setInterval(() => {
          try {
            document.querySelector('#enemy-character__btn-prev').click()
            // document.querySelector('#enemy-character__btn-next').click()
            this.roomConnection.updateBalance()
            const overModalDisplay = document.getElementById("over_modal").style.display
            if (overModalDisplay == 'flex') {
              document.getElementById("canvas").style.display = 'none'
            }
          } catch (error) {
            console.log(error)
          }
        }, 5000)
        // ig.main('#canvas', MyGame, 60, chosenMap.x * 1.5, chosenMap.y * 2, ig.ua.mobile ? 0.5 : 3);

      },
    
      connect: async function() {
        var pubkey = localStorage.getItem("publicKey")
        this.roomConnection.connect(address, pubkey);
      },

      enemyStats: function(player) {
        const balance = localStorage.getItem(`${player.toLowerCase()}_balance_${Network.chainid}_${GameID}`)
        const kills = localStorage.getItem(`${player.toLowerCase()}_kills_${Network.chainid}_${GameID}`)
        const deaths = localStorage.getItem(`${player.toLowerCase()}_deaths_${Network.chainid}_${GameID}`)
        document.querySelector('#enemyDepTopBar').textContent = balance
        document.querySelector('#enemyKillsLive').textContent = kills
        document.querySelector('#enemyDeathsLive').textContent = deaths
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



function openStats() {
  let statsOpened = document.querySelector(".stats_modal").style.display == "flex";

  document.querySelector(".stats_modal").style.display = statsOpened ? "none" : "flex";
}
function pauseBtn() {
  document.querySelector(".ton_pause_modal").style.display = "block";
}
function unpauseBtn() {
  document.querySelector(".ton_pause_modal").style.display = "none";
}