const TECLA = {
   ARROW_LEFT:  37,
   ARROW_UP:    38,
   ARROW_RIGHT: 39,
   ARROW_DOWN:  40,
   FIRE: 68
}

const gameConfig = {
   score: {},
   sounds: {},
   keyPressed: {},
   
   power: 3,
   playerCanShot: true,
   gameOver: false,
   background: null,
   playerHelicopter: null,
   enemyHelicopter: null,
   enemyHelicopterVelocity: 5,
   enemyTruck: null,
   enemyTruckVelocity: 3,
   friend: null,
   bullet: null,
   bulletInterval: null,
   explosion: null,
   eMap: null,
}

let game = {};

//---------------------------------------------------------------------
function start()
{ 
   reset();

   $(document).keydown(e => game.keyPressed[e.which] = true);
   $(document).keyup(e => game.keyPressed[e.which] = false);

   game.loopInterval = window.setInterval(loop, 30);

   $("#gameStart").hide();
}

//---------------------------------------------------------------------
function reset()
{
   game = { ...gameConfig };
   game.score = { saved: 0, lost: 0, points: 0 };
   game.eMap = new Map();
   
   const gameoverView = $("#gameover");
   if (gameoverView)
      gameoverView.remove();

   if (game.sounds.gameoverMusic)
   {
      game.sounds.gameoverMusic.pause();
      game.sounds.gameoverMusic.currentTime = 0;
   }

   initScene();
   initSounds();
}

//---------------------------------------------------------------------
function initScene()
{
   game.background = $("#gameBackground");

   game.background.append("<div id='scoreBoard'></div>");
   game.scoreBoard = $("#scoreBoard");

   game.background.append("<div id='powerBoard'></div>");
   game.powerBoard = $("#powerBoard");
   
   game.background.append(`<div id="palyerHelicopter" class='player-helicopter-animation'></div>`);
   game.playerHelicopter = $("#palyerHelicopter");
   game.playerHelicopter.css("top", parseInt(100 + Math.random() * 230));
   game.playerHelicopter.css("left", 100);
   game.eMap.set(game.playerHelicopter.selector, game.playerHelicopter);

   game.background.append(`<div id="enemyHelicopter" class='enemy-helicopter-animation enemy'></div>`);
   game.enemyHelicopter = $("#enemyHelicopter");
   game.enemyHelicopter.css("top", parseInt(Math.random() * 334));
   game.eMap.set(game.enemyHelicopter.selector, game.enemyHelicopter);

   game.background.append(`<div id="enemyTruck" class='enemy'></div>`);
   game.enemyTruck = $("#enemyTruck");
   game.enemyTruck.css("left", 1000);
   game.eMap.set(game.enemyTruck.selector, game.enemyTruck);

   game.background.append(`<div id="friend" class='friend-animation'></div>`);
   game.friend = $("#friend")

   game.background.append(`<div id="bullet"></div`);
   game.bullet = $("#bullet");
   game.bullet.hide();
   game.eMap.set(game.bullet.selector, game.bullet);
}

//---------------------------------------------------------------------
function initSounds()
{
   game.sounds= {
      bulletFire: document.getElementById("bulletFire"),
      explosionSound: document.getElementById("explosionSound"),
      backgroundMusic: document.getElementById("backgroundMusic"),
      gameoverMusic: document.getElementById("gameoverMusic"),
      lostMusic: document.getElementById("lostMusic"),
      saveMusic: document.getElementById("saveMusic"),
   }

   const music = game.sounds.backgroundMusic;
   music.addEventListener("ended", () =>
   {
      if (game.gameOver)
         return;
      
      music.currentTime = 0;
      music.play();
   }, false);
   music.play();
}

//---------------------------------------------------------------------
function refreshScoreBoard()
{
   game.scoreBoard.html(`
      <h2> Pontos  : ${ game.score.points }\n
           Salvos  : ${ game.score.saved }\n
           Perdidos: ${ game.score.lost }
      </h2>`);
}

//---------------------------------------------------------------------
function refreshPower()
{
   if (game.gameOver)
      return;
   
   game.powerBoard.css("background-image", `url(./imgs/power-${ game.power }.png)`);   

   game.gameOver = (game.power === 0);
} 

//---------------------------------------------------------------------
function loop()
{
   if (game.gameOver)
   {
      window.clearInterval(game.loopInterval);
      gameOver();
      return;
   }
   moveBackground();
   movePlayer();
   moveEnemy();
   moveFriend();
   colisionManager();
   refreshScoreBoard();
}

//---------------------------------------------------------------------
function moveBackground()
{
   const position = "background-position";
   const left = parseInt(game.background.css(position));
   game.background.css(position, left - 1);
}

//---------------------------------------------------------------------
function movePlayer()
{
   if (game.keyPressed[TECLA.ARROW_UP])
      movePlayerUp();
   
   if (game.keyPressed[TECLA.ARROW_DOWN])
      movePlayerDown();
   
   if (game.keyPressed[TECLA.ARROW_LEFT])
      movePlayerLeft();
   
   if (game.keyPressed[TECLA.ARROW_RIGHT])
      movePlayerRight();
   
   if (game.keyPressed[TECLA.FIRE])
      playerShotGun();
   
   trySaveFriend();
} 

//---------------------------------------------------------------------
function movePlayerUp()
{
   const top = parseInt(game.playerHelicopter.css("top"));
   
   if ( (top - 10) > 0)
      game.playerHelicopter.css("top", top - 10);
}

//---------------------------------------------------------------------
function movePlayerDown()
{
   const top = parseInt(game.playerHelicopter.css("top"));

   if ( (top - 10) < 434)
      game.playerHelicopter.css("top", top + 10);
}

//---------------------------------------------------------------------
function movePlayerLeft()
{
   const left = parseInt(game.playerHelicopter.css("left"));

   if ( left > 10)
      game.playerHelicopter.css("left", left - 10);
}

//---------------------------------------------------------------------
function movePlayerRight()
{
   const left = parseInt(game.playerHelicopter.css("left"));

   if ( left < 700)
      game.playerHelicopter.css("left", left + 10);
}

//---------------------------------------------------------------------
function moveEnemy()
{
   moveEnemyHelicopter();
   moveEnemyTruck();
}

//---------------------------------------------------------------------
function moveEnemyHelicopter()
{
   if (game.enemyHelicopter.is(":hidden"))
      return;
   
   const positionX = parseInt(game.enemyHelicopter.css("left")) - game.enemyHelicopterVelocity;
   
   if (positionX > -10)
      game.enemyHelicopter.css("left", positionX);
   else
      reposition(game.enemyHelicopter);
}

//---------------------------------------------------------------------
function moveEnemyTruck()
{
   if (game.enemyTruck.is(":hidden"))
      return;
   
   const positionX = parseInt(game.enemyTruck.css("left")) - game.enemyTruckVelocity;
   if(positionX > 0)
      game.enemyTruck.css("left", positionX)
   else
      reposition(game.enemyTruck);
}

//---------------------------------------------------------------------
function moveFriend()
{
   const positionX = parseInt(game.friend.css("left"));
   if (positionX > 900)
   {
      game.score.saved++;
      game.friend.css("left", 0);
   }
   else
      game.friend.css("left", (positionX + 1));
}

//---------------------------------------------------------------------
function moveBullet()
{
   if (game.bullet.is("hidden"))
      return;
   
   const positionX = parseInt(game.bullet.css("left"));
   game.bullet.css("left", positionX + 15);

   if (positionX + 15 < 1000)
      return;
   
   window.clearInterval(game.bulletInterval);
   game.bullet.hide();
   game.playerCanShot = true;
}

//---------------------------------------------------------------------
function playerShotGun()
{
   if (!game.playerCanShot)
      return;

   game.playerCanShot = false;

   const top = parseInt(game.playerHelicopter.css("top"))
   const positionX = parseInt(game.playerHelicopter.css("left"))

   game.bullet.css("top", top + 37);
   game.bullet.css("left", positionX + 190);
   game.bullet.show();

   game.bulletInterval = window.setInterval(moveBullet, 30);

   game.sounds.bulletFire.play();
}

//---------------------------------------------------------------------
function colisionManager()
{
   bulletCollision();
   playerCollision();
   friendCollision();
}

//---------------------------------------------------------------------
function bulletCollision()
{
   if (game.bullet.is(":hidden"))
      return;
   
   const hits = game.bullet.collision(".enemy");
   for (let i = 0; i < hits.length; i++)
   {
      game.bullet.hide();
      game.score.points += 100;
      window.clearInterval(game.bulletInterval);
      game.playerCanShot = true;
      
      const hit = game.eMap.get(`#${ hits[i].id }`);
      hitTarget(hit);
      explodeElement(hit);
   }
}

//---------------------------------------------------------------------
function playerCollision()
{
   const hits = game.playerHelicopter.collision('.enemy');

   if (hits.length > 0)
   {
      game.power--;
      refreshPower();
   }
   for (let i = 0; i < hits.length; i++)
   {
      explodeElement(game.eMap.get(`#${ hits[i].id }`));
   }
}

//---------------------------------------------------------------------
function friendCollision()
{
   if (game.friend.is(":hidden"))
      return;
   
   const hits = game.friend.collision(".enemy");
   if(hits.length)
   {
      game.score.lost++;
      game.friend.hide();
      game.background.append("<div id='friendExplosion' class='friend-explosion-animation'></div")
      const explosion = $("#friendExplosion");
      explosion.css("top", game.friend.css("top"));
      explosion.css("left", game.friend.css("left"));
      game.sounds.lostMusic.play();

      window.setTimeout((explosion) => {
         explosion.remove();
      }, 1000, explosion);
      
      friendReposition();
   }
}

//---------------------------------------------------------------------
function trySaveFriend()
{
   if (game.friend.is(":hidden"))
      return;

   const hits = game.playerHelicopter.collision("#friend");
   if (hits.length == 0)
      return;
      
   game.friend.hide();
   game.score.saved++;
   game.sounds.saveMusic.play();
   friendReposition();
}

//---------------------------------------------------------------------
function explodeElement(element)
{
   element.hide();
   
   game.background.append(`<div id="explosion" ></div`);
   explosion = $("#explosion");
   explosion.css("top", parseInt(element.css("top")));
   explosion.css("left", parseInt(element.css("left")));
   explosion.show();
   explosion.animate({ width: parseInt(element.css("width")), opacity: 0 }, 1000, endExplosion);
   game.sounds.explosionSound.play();
   function endExplosion()
   {
      explosion.remove();
   }   
   reposition(element);
}

//---------------------------------------------------------------------
function reposition(element)
{
   element.hide();

   if (game.gameOver)
      return;
   
   if (element === game.enemyHelicopter)
      window.setTimeout(enemyHelicopterReposition, 3000);
   else if (element === game.enemyTruck)
      window.setTimeout(enemyTruckReposition, 3000);
   else if (element === game.friend)
      window.setTimeout(friendReposition, 3000);
}

//---------------------------------------------------------------------
function enemyHelicopterReposition()
{
   game.enemyHelicopter.css("left", 694);
   game.enemyHelicopter.css("top", parseInt(Math.random() * 334));
   game.enemyHelicopter.show();
}

//---------------------------------------------------------------------
function enemyTruckReposition()
{
   game.enemyTruck.css("left", "775px");
   game.enemyTruck.css("top", "447px");
   game.enemyTruck.show();
}

//---------------------------------------------------------------------
function friendReposition()
{
   window.setTimeout((friend) =>
   {
      friend.css("left", 0);
      game.friend.show();
   }, 3000, game.friend);
}

//---------------------------------------------------------------------
function hitTarget(hit)
{
   if (hit === game.enemyTruck)
      game.enemyTruckVelocity *= 1.1;
   
   if (hit === game.enemyHelicopter)
      game.enemyHelicopterVelocity *= 1.1;
} 

//---------------------------------------------------------------------
function gameOver()
{
   game.gameOver = true;
   game.sounds.gameoverMusic.play();

   game.playerHelicopter.remove();
   game.enemyTruck.remove();
   game.enemyHelicopter.remove();
   game.bullet.remove();
   game.friend.remove();
   game.scoreBoard.remove();
   game.powerBoard.remove();

   game.background.append("<div id='gameover'></div>");
   $("#gameover").html(`
      <h1> Game Over </h1>
      <p>Sua pontuação foi: ${game.score.points}</p>
      <div id='restart' onClick = start()>
         <h3>Jogar Novamente</h3>
      </div>
   `);
}
//---------------------------------------------------------------------